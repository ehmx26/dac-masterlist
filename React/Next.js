import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

export default function ComplianceTable() {
  const [data, setData] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Load saved data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('complianceData');
    if (savedData) {
      setData(JSON.parse(savedData));
    }
  }, []);

  // Handle Excel Upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const parsedData = XLSX.utils.sheet_to_json(ws);

      setData(parsedData);
      localStorage.setItem('complianceData', JSON.stringify(parsedData));
      alert('Excel file uploaded and website updated successfully!');
    };
    reader.readAsBinaryString(file);
  };

  // Filter records based on status dropdown
  const filteredData = data.filter((row) => {
    if (filterStatus === 'ALL') return true;
    // Adjust key name based on your exact Excel column header (e.g., COMPLIANCE_STATUS or STATUS)
    return row.COMPLIANCE_STATUS?.toLowerCase() === filterStatus.toLowerCase();
  });

  return (
    <div className="p-6 bg-slate-900 min-h-screen text-white">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-slate-800 p-4 rounded-xl shadow">
        <div>
          <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg shadow transition inline-block">
            📁 Upload Updated Excel
            <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>

        <div>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-700 text-white px-3 py-2 rounded-lg border border-slate-600 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive / Expired</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-slate-800 rounded-xl shadow">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-700 text-slate-400 text-sm">
              <th className="p-4">CODE / NAME</th>
              <th className="p-4">DEPARTMENT</th>
              <th className="p-4">EMAIL ID</th>
              <th className="p-4">VISA EXPIRY</th>
              <th className="p-4">PASSPORT EXPIRY</th>
              <th className="p-4">CONTRACT EXPIRY</th>
              <th className="p-4">STATUS</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((row, index) => (
                <tr key={index} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                  <td className="p-4 font-medium">{row.CODE_NAME || row.NAME}</td>
                  <td className="p-4 text-slate-300">{row.DEPARTMENT}</td>
                  <td className="p-4 text-slate-300">{row.EMAIL_ID}</td>
                  <td className="p-4 text-slate-300">{row.VISA_EXPIRY}</td>
                  <td className="p-4 text-slate-300">{row.PASSPORT_EXPIRY}</td>
                  <td className="p-4 text-slate-300">{row.CONTRACT_EXPIRY}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      row.COMPLIANCE_STATUS?.toLowerCase() === 'active' 
                        ? 'bg-emerald-500/20 text-emerald-400' 
                        : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {row.COMPLIANCE_STATUS || 'Active'}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="p-8 text-center text-slate-400">
                  No records found. Upload your Excel spreadsheet above to populate the table.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
