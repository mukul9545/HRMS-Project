from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import date, datetime
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import enum
import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "hrms_db")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

try:
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
except Exception as e:
    raise

employees_collection = db["employees"]
attendance_collection = db["attendance"]

class AttendanceStatus(str, enum.Enum):
    PRESENT = "Present"
    ABSENT = "Absent"

class EmployeeCreate(BaseModel):
    employee_id: str = Field(..., min_length=1)
    full_name: str = Field(..., min_length=1)
    email: EmailStr
    department: str = Field(..., min_length=1)

class EmployeeResponse(BaseModel):
    id: str
    employee_id: str
    full_name: str
    email: str
    department: str

class AttendanceCreate(BaseModel):
    employee_id: str = Field(..., min_length=1)
    date: date
    status: AttendanceStatus

class AttendanceResponse(BaseModel):
    id: str
    employee_id: str
    date: date
    status: AttendanceStatus

class EmployeeStats(BaseModel):
    employee_id: str
    full_name: str
    total_present: int
    total_absent: int
    total_days: int

class MonthlyAttendanceStats(BaseModel):
    employee_id: str
    full_name: str
    department: str
    month: int
    year: int
    total_days: int
    present_days: int
    absent_days: int
    attendance_rate: float

app = FastAPI(title="HRMS API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        FRONTEND_URL.rstrip("/"),
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_db_client():
    try:
        await client.admin.command('ping')
    except Exception as e:
        pass

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

def employee_helper(employee) -> dict:
    return {
        "id": str(employee["_id"]),
        "employee_id": employee["employee_id"],
        "full_name": employee["full_name"],
        "email": employee["email"],
        "department": employee["department"]
    }

def attendance_helper(attendance) -> dict:
    return {
        "id": str(attendance["_id"]),
        "employee_id": attendance["employee_id"],
        "date": attendance["date"],
        "status": attendance["status"]
    }

@app.post("/api/employees", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
async def create_employee(employee: EmployeeCreate):
    try:
        existing_employee = await employees_collection.find_one({"employee_id": employee.employee_id})
        if existing_employee:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Employee ID '{employee.employee_id}' already exists"
            )
        
        existing_email = await employees_collection.find_one({"email": employee.email})
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Email '{employee.email}' already exists"
            )
        
        existing_dept = await employees_collection.find_one({
            "department": {"$regex": f"^{employee.department}$", "$options": "i"}
        })
        
        employee_dict = employee.model_dump()
        
        if existing_dept:
            employee_dict["department"] = existing_dept["department"]
        
        result = await employees_collection.insert_one(employee_dict)
        new_employee = await employees_collection.find_one({"_id": result.inserted_id})
        return employee_helper(new_employee)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/api/employees", response_model=List[EmployeeResponse])
async def get_employees():
    try:
        employees = []
        async for employee in employees_collection.find():
            employees.append(employee_helper(employee))
        return employees
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/api/employees/{employee_id}", response_model=EmployeeResponse)
async def get_employee(employee_id: str):
    try:
        employee = await employees_collection.find_one({"employee_id": employee_id})
        if not employee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Employee '{employee_id}' not found"
            )
        return employee_helper(employee)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.delete("/api/employees/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_employee(employee_id: str):
    try:
        employee = await employees_collection.find_one({"employee_id": employee_id})
        if not employee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Employee '{employee_id}' not found"
            )
        
        await attendance_collection.delete_many({"employee_id": employee_id})
        await employees_collection.delete_one({"employee_id": employee_id})
        return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.post("/api/attendance", response_model=AttendanceResponse, status_code=status.HTTP_201_CREATED)
async def create_attendance(attendance: AttendanceCreate):
    try:
        employee = await employees_collection.find_one({"employee_id": attendance.employee_id})
        if not employee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Employee '{attendance.employee_id}' not found"
            )
        
        existing = await attendance_collection.find_one({
            "employee_id": attendance.employee_id,
            "date": attendance.date.isoformat()
        })
        
        if existing:
            await attendance_collection.update_one(
                {"_id": existing["_id"]},
                {"$set": {"status": attendance.status}}
            )
            updated = await attendance_collection.find_one({"_id": existing["_id"]})
            return attendance_helper(updated)
        
        attendance_dict = attendance.model_dump()
        attendance_dict["date"] = attendance.date.isoformat()
        result = await attendance_collection.insert_one(attendance_dict)
        new_attendance = await attendance_collection.find_one({"_id": result.inserted_id})
        return attendance_helper(new_attendance)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/api/attendance", response_model=List[AttendanceResponse])
async def get_attendance(
    employee_id: Optional[str] = None,
    date: Optional[str] = None
):
    try:
        query = {}
        if employee_id:
            query["employee_id"] = employee_id
        if date:
            query["date"] = date
        
        attendance_list = []
        async for attendance in attendance_collection.find(query).sort("date", -1):
            attendance_list.append(attendance_helper(attendance))
        return attendance_list
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/api/attendance/stats", response_model=List[EmployeeStats])
async def get_attendance_stats():
    try:
        stats = []
        async for employee in employees_collection.find():
            attendance_records = []
            async for record in attendance_collection.find({"employee_id": employee["employee_id"]}):
                attendance_records.append(record)
            
            total_present = sum(1 for a in attendance_records if a["status"] == "Present")
            total_absent = sum(1 for a in attendance_records if a["status"] == "Absent")
            
            stats.append(EmployeeStats(
                employee_id=employee["employee_id"],
                full_name=employee["full_name"],
                total_present=total_present,
                total_absent=total_absent,
                total_days=len(attendance_records)
            ))
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/api/attendance/monthly-stats/{employee_id}", response_model=MonthlyAttendanceStats)
async def get_monthly_attendance_stats(
    employee_id: str,
    month: Optional[int] = None,
    year: Optional[int] = None
):
    try:
        employee = await employees_collection.find_one({"employee_id": employee_id})
        if not employee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Employee '{employee_id}' not found"
            )
        
        now = datetime.now()
        target_month = month if month is not None else now.month
        target_year = year if year is not None else now.year
        
        if target_month == 12:
            next_month = 1
            next_year = target_year + 1
        else:
            next_month = target_month + 1
            next_year = target_year
        
        start_date = date(target_year, target_month, 1).isoformat()
        end_date = date(next_year, next_month, 1).isoformat()
        
        attendance_records = []
        async for record in attendance_collection.find({
            "employee_id": employee_id,
            "date": {"$gte": start_date, "$lt": end_date}
        }):
            attendance_records.append(record)
        
        total_days = len(attendance_records)
        present_days = sum(1 for record in attendance_records if record["status"] == "Present")
        absent_days = total_days - present_days
        attendance_rate = (present_days / total_days * 100) if total_days > 0 else 0.0
        
        return MonthlyAttendanceStats(
            employee_id=employee["employee_id"],
            full_name=employee["full_name"],
            department=employee["department"],
            month=target_month,
            year=target_year,
            total_days=total_days,
            present_days=present_days,
            absent_days=absent_days,
            attendance_rate=round(attendance_rate, 1)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/")
async def root():
    return {"message": "HRMS API", "status": "running"}

@app.get("/health")
async def health():
    try:
        await client.admin.command('ping')
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": "disconnected", "error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)