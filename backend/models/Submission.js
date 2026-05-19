const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  languageId: { type: Number, required: true },
  languageName: { type: String, required: true },
  sourceCode: { type: String, required: true },
  stdin: { type: String, default: '' },
  stdout: { type: String, default: '' },
  stderr: { type: String, default: '' },
  compileOutput: { type: String, default: '' },
  status: { 
    id: { type: Number, required: true },
    description: { type: String, required: true }
  },
  executionTime: { type: String, default: null }, // time in seconds
  memory: { type: Number, default: null }, // memory in KB
}, { timestamps: true });

module.exports = mongoose.model('Submission', submissionSchema);
