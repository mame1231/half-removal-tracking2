const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Initialize app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'client/build')));

// Connect to SQLite database
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
  } else {
    console.log('Connected to the SQLite database');
    initializeDatabase();
  }
});

// Initialize database tables if they don't exist
function initializeDatabase() {
  db.serialize(() => {
    // Create patients table
    db.run(`CREATE TABLE IF NOT EXISTS patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    // Create treatments table
    db.run(`CREATE TABLE IF NOT EXISTS treatments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER,
      treatment_type TEXT NOT NULL,
      treatment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients (id)
    )`);

    // Insert sample data if not exists
    db.get("SELECT COUNT(*) as count FROM patients", (err, row) => {
      if (err) {
        console.error(err.message);
        return;
      }
      
      if (row.count === 0) {
        console.log("Inserting sample data...");
        insertSampleData();
      }
    });
  });
}

// Insert sample data
function insertSampleData() {
  const patients = [
    { name: '山田花子', phone: '090-1234-5678', email: 'hanako@example.com', notes: '敏感肌' },
    { name: '鈴木太郎', phone: '080-8765-4321', email: 'taro@example.com', notes: '予約時間に遅れることが多い' },
    { name: '佐藤由美', phone: '070-2468-1357', email: 'yumi@example.com', notes: '' }
  ];

  const treatments = [
    // 山田花子
    { patient_name: '山田花子', treatment_type: '全身脱毛（顔、うなじ、VIO込み）', dates: ['2024-01-15', '2024-02-15', '2024-03-15', '2024-04-15', '2024-05-15'] },
    { patient_name: '山田花子', treatment_type: '女性顔脱毛', dates: ['2024-01-30', '2024-03-01'] },
    
    // 鈴木太郎
    { patient_name: '鈴木太郎', treatment_type: '全身脱毛（顔、うなじ、VIO込み）', dates: ['2024-01-10', '2024-02-10'] },
    { patient_name: '鈴木太郎', treatment_type: '男性ひげ脱毛', dates: ['2024-02-25', '2024-03-25', '2024-04-25'] },
    
    // 佐藤由美
    { patient_name: '佐藤由美', treatment_type: '女性顔脱毛', dates: ['2024-01-05', '2024-02-05', '2024-03-05', '2024-04-05', '2024-05-05', 
      '2024-06-05', '2024-07-05', '2024-08-05', '2024-09-05', '2024-10-05', '2024-11-05'] }
  ];

  // Insert patients
  patients.forEach(patient => {
    db.run(`INSERT INTO patients (name, phone, email, notes) VALUES (?, ?, ?, ?)`,
      [patient.name, patient.phone, patient.email, patient.notes]
    );
  });

  // Get patient IDs
  setTimeout(() => {
    treatments.forEach(treatment => {
      db.get(`SELECT id FROM patients WHERE name = ?`, [treatment.patient_name], (err, row) => {
        if (err || !row) {
          console.error('Error finding patient:', treatment.patient_name, err);
          return;
        }
        
        const patientId = row.id;
        
        // Insert treatments for patient
        treatment.dates.forEach(date => {
          db.run(`INSERT INTO treatments (patient_id, treatment_type, treatment_date) VALUES (?, ?, ?)`,
            [patientId, treatment.treatment_type, date]
          );
        });
      });
    });
  }, 1000); // Small delay to ensure patients are inserted first
}

// API Routes
// Get all patients
app.get('/api/patients', (req, res) => {
  db.all(`SELECT * FROM patients ORDER BY name`, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get a single patient
app.get('/api/patients/:id', (req, res) => {
  db.get(`SELECT * FROM patients WHERE id = ?`, [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(row);
  });
});

// Get patient's treatment counts and discount status
app.get('/api/patients/:id/treatments/summary', (req, res) => {
  const patientId = req.params.id;
  
  db.all(`SELECT treatment_type, COUNT(*) as count 
          FROM treatments 
          WHERE patient_id = ? 
          GROUP BY treatment_type`, 
    [patientId], 
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      // Process counts and calculate discounts
      let fullBodyCount = 0;
      let faceCount = 0;
      let beardCount = 0;
      
      rows.forEach(row => {
        if (row.treatment_type === '全身脱毛（顔、うなじ、VIO込み）') {
          fullBodyCount = row.count;
          // Add to face count as well since full body includes face
          faceCount += row.count;
        } else if (row.treatment_type === '女性顔脱毛') {
          faceCount += row.count;
        } else if (row.treatment_type === '男性ひげ脱毛') {
          beardCount = row.count;
        }
      });
      
      // Determine discount status
      const fullBodyDiscount = fullBodyCount >= 6 ? '半額適用' : '通常価格';
      const faceDiscount = faceCount >= 11 ? '半額適用' : '通常価格';
      const beardDiscount = beardCount >= 11 ? '半額適用' : '通常価格';
      
      res.json({
        treatments: {
          '全身脱毛（顔、うなじ、VIO込み）': {
            count: fullBodyCount,
            discount: fullBodyDiscount
          },
          '女性顔脱毛': {
            count: faceCount - fullBodyCount, // Only separate face treatments
            totalFaceCount: faceCount, // Combined count
            discount: faceDiscount
          },
          '男性ひげ脱毛': {
            count: beardCount,
            discount: beardDiscount
          }
        }
      });
    }
  );
});

// Get all treatments for a patient
app.get('/api/patients/:id/treatments', (req, res) => {
  db.all(`SELECT * FROM treatments WHERE patient_id = ? ORDER BY treatment_date DESC`, 
    [req.params.id], 
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );
});

// Add a new patient
app.post('/api/patients', (req, res) => {
  const { name, phone, email, notes } = req.body;
  
  if (!name) {
    res.status(400).json({ error: "Patient name is required" });
    return;
  }
  
  db.run(`INSERT INTO patients (name, phone, email, notes) VALUES (?, ?, ?, ?)`,
    [name, phone, email, notes],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      res.json({ 
        id: this.lastID,
        message: "Patient added successfully" 
      });
    }
  );
});

// Update a patient
app.put('/api/patients/:id', (req, res) => {
  const { name, phone, email, notes } = req.body;
  
  if (!name) {
    res.status(400).json({ error: "Patient name is required" });
    return;
  }
  
  db.run(`UPDATE patients SET name = ?, phone = ?, email = ?, notes = ? WHERE id = ?`,
    [name, phone, email, notes, req.params.id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      res.json({ 
        message: "Patient updated successfully",
        changes: this.changes
      });
    }
  );
});

// Add a new treatment
app.post('/api/treatments', (req, res) => {
  const { patient_id, treatment_type, treatment_date } = req.body;
  
  if (!patient_id || !treatment_type) {
    res.status(400).json({ error: "Patient ID and treatment type are required" });
    return;
  }
  
  const date = treatment_date || new Date().toISOString().split('T')[0];
  
  db.run(`INSERT INTO treatments (patient_id, treatment_type, treatment_date) VALUES (?, ?, ?)`,
    [patient_id, treatment_type, date],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      res.json({ 
        id: this.lastID,
        message: "Treatment added successfully" 
      });
    }
  );
});

// Delete a treatment
app.delete('/api/treatments/:id', (req, res) => {
  db.run(`DELETE FROM treatments WHERE id = ?`, [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    res.json({ 
      message: "Treatment deleted successfully",
      changes: this.changes
    });
  });
});

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Close database connection on app termination
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Database connection closed');
    process.exit(0);
  });
});
