// models/Dataset.js

const mongoose = require('mongoose');

const datasetSchema = new mongoose.Schema({
  maritalStatus: String,
  applicationMode: Number,
  applicationOrder: Number,
  course: String,
  attendanceTime: String, 
  previousQualification: String,
  nationality: String,
  motherQualification: String,
  fatherQualification: String,
  motherOccupation: String,
  fatherOccupation: String,
  displaced: Boolean,
  specialNeeds: Boolean,
  debtor: Boolean,
  tuitionUpToDate: Boolean,
  gender: String,
  scholarshipHolder: Boolean,
  ageAtEnrollment: Number,
  international: Boolean,

  curricularUnits1stSemCredited: Number,
  curricularUnits1stSemEnrolled: Number,
  curricularUnits1stSemEvaluations: Number,
  curricularUnits1stSemApproved: Number,
  curricularUnits1stSemGrade: Number,
  curricularUnits1stSemWithoutEvaluations: Number,

  curricularUnits2ndSemCredited: Number,
  curricularUnits2ndSemEnrolled: Number,
  curricularUnits2ndSemEvaluations: Number,
  curricularUnits2ndSemApproved: Number,
  curricularUnits2ndSemGrade: Number,
  curricularUnits2ndSemWithoutEvaluations: Number,

  unemploymentRate: Number,
  inflationRate: Number,
  gdp: Number,

  target: String // classification label (e.g., 'Dropout', 'Graduate', etc.)
});

module.exports = mongoose.model('Dataset', datasetSchema);
