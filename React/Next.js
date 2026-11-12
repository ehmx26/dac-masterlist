import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

export default function ComplianceDashboard() {
  const [data, setData] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Load saved data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('complianceMasterData');
    if (savedData) {
      try {
        setData(JSON.parse(savedData));
      } catch (err) {
        console.error("Error parsing stored data", err);
      }
    }
  }, []);

  // Handle Excel/CSV File Upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const parsedData = XLSX.utils.sheet_to_json(ws);

        setData(parsedData);
        localStorage.setItem('complianceMasterData', JSON.stringify(parsedData));
        alert('Excel file uploaded and website updated successfully!');
      } catch (error) {
        console.error("Error reading Excel file:", error);
        alert('Failed to parse Excel file. Please ensure it is a valid .xlsx or .csv file.');
      }
    };
    reader.readAsBinaryString(file);
  };

  // Filter records based on Status dropdown & Search query
  const filteredData = data.filter((row) => {
    // Status filter check (checks COMPLIANCE_STATUS or STATUS column)
    const statusVal = (row.COMPLIANCE_STATUS || row.STATUS || 'Active').toString().toLowerCase();
    const matchesStatus = 
      filterStatus === 'ALL' || statusVal === filterStatus.toLowerCase();

    // Search query check across name, department, or email
    const rowString = Object.values(row).join(' ').toLowerCase();
    const matchesSearch = rowString.includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="p-6 bg-slate-900 min-h-screen text-white font-sans">
      {/* Top Header & Actions Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 bg-slate-800 p-4 rounded-xl shadow border border-slate-700">
        
        {/* Upload Button */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-lg shadow transition flex items-center gap-2">
            <span>📁 Upload Updated Excel</span>
            <input 
              type="file" 
              accept=".xlsx, .xls, .csv" 
              onChange={handleFileUpload} 
              className="hidden" 
            />
          </label>
          <span className="text-xs text-slate-400">
            {data.length > 0 ? `${data.length} records loaded` : 'No file uploaded yet'}
          </span>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Search Bar */}
          <input 
            type="text"
            placeholder="Search employee, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-slate-700 text-white px-3 py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-blue-500 text-sm"
          />

          {/* Status Filter Dropdown */}
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-700 text-white px-3 py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-blue-500 text-sm"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive / Expired</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto bg-slate-800 rounded-xl shadow border border-slate-700">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-700 text-slate-400 text-xs tracking-wider uppercase">
              <th className="p-4">CODE / NAME</th>
              <th className="p-4">DEPARTMENT</th>
              <th className="p-4">EMAIL ID</th>
              <th className="p-4">VISA EXPIRY</th>
              <th className="p-4">PASSPORT EXPIRY</th>
              <th className="p-4">CONTRACT EXPIRY</th>
              <th className="p-4">COMPLIANCE STATUS</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {filteredData.length > 0 ? (
              filteredData.map((row, index) => {
                const status = row.COMPLIANCE_STATUS || row.STATUS || 'Active';
                return (
                  <tr key={index} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition">
                    <td className="p-4 font-medium text-slate-100">{row.CODE_NAME || row.NAME || '-'}</td>
                    <td className="p-4 text-slate-300">{row.DEPARTMENT || '-'}</td>
                    <td className="p-4 text-slate-300">{row.EMAIL_ID || '-'}</td>
                    <td className="p-4 text-slate-300">{row.VISA_EXPIRY || '-'}</td>
                    <td className="p-4 text-slate-300">{row.PASSPORT_EXPIRY || '-'}</td>
                    <td className="p-4 text-slate-300">{row.CONTRACT_EXPIRY || '-'}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${
                        status.toLowerCase() === 'active' 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}>
                        {status}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="p-12 text-center text-slate-400">
                  <p className="text-base font-medium mb-1">No employee records found.</p>
                  <p className="text-xs text-slate-500">Click the blue "Upload Updated Excel" button above to import your spreadsheet.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
