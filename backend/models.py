from sqlalchemy import Column, Integer, String, Date, Time, ForeignKey
from sqlalchemy.orm import relationship
from db import Base

class Doctor(Base):
    __tablename__ = "doctors"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    specialization = Column(String)
    
    appointments = relationship("Appointment", back_populates="doctor")

class Appointment(Base):
    __tablename__ = "appointments"
    
    id = Column(Integer, primary_key=True, index=True)
    doctor_id = Column(Integer, ForeignKey("doctors.id"))
    patient_name = Column(String)
    date = Column(Date)
    time = Column(Time)
    status = Column(String, default="booked")
    
    doctor = relationship("Doctor", back_populates="appointments")

class PatientHistory(Base):
    __tablename__ = "patient_histories"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_name = Column(String)
    symptoms = Column(String)
    visit_date = Column(Date)

class Patient(Base):
    __tablename__ = "patients"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)  # Storing plain text for demo; use hashing in prod
