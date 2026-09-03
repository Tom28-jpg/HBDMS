/**
 * CSV Export utility for HBDMS records
 */
export function exportToCSV(filename: string, rows: Record<string, any>[], customHeaders?: Record<string, string>) {
  if (!rows || !rows.length) {
    alert('No records available to export.');
    return;
  }

  // Determine keys from customHeaders or first row
  const keys = customHeaders ? Object.keys(customHeaders) : Object.keys(rows[0]);
  const headerLabels = customHeaders ? Object.values(customHeaders) : keys;

  const csvRows: string[] = [];

  // Header row
  csvRows.push(headerLabels.map((h) => `"${String(h).replace(/"/g, '""')}"`).join(','));

  // Data rows
  for (const row of rows) {
    const values = keys.map((key) => {
      let val = row[key];
      if (val === undefined || val === null) {
        return '""';
      }
      if (typeof val === 'object') {
        if (Array.isArray(val)) {
          // Flatten checklist or doc list
          val = val.map((v) => (typeof v === 'object' ? v.name || JSON.stringify(v) : v)).join('; ');
        } else {
          val = JSON.stringify(val);
        }
      }
      const stringVal = String(val).replace(/"/g, '""');
      return `"${stringVal}"`;
    });
    csvRows.push(values.join(','));
  }

  const csvString = csvRows.join('\r\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Printable HTML / PDF-ready Dossier for equipment and selected related reports
 */
export function printEquipmentDossier(
  hospitalName: string,
  asset: any,
  relatedRecords: {
    breakdowns?: any[];
    pms?: any[];
    calibrations?: any[];
    services?: any[];
    gatePasses?: any[];
    dailyRounds?: any[];
  },
  selectedTypes: string[]
) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to generate the printable equipment dossier.');
    return;
  }

  const assetId = asset.assetId || asset.id;
  const equipName = asset.equipmentName || 'Biomedical Equipment';

  let relatedHtml = '';

  if (selectedTypes.includes('breakdown') && relatedRecords.breakdowns?.length) {
    relatedHtml += `
      <div class="section">
        <h3>Breakdown & Corrective Maintenance History (${relatedRecords.breakdowns.length})</h3>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Problem Description</th>
              <th>Assigned Person / Vendor</th>
              <th>Downtime</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${relatedRecords.breakdowns.map((b: any) => `
              <tr>
                <td>${b.breakdownDate || '—'}</td>
                <td>${b.problemDescription || '—'}</td>
                <td>${b.assignedPerson || '—'}</td>
                <td>${b.downtimeHours ? b.downtimeHours + ' hrs' : '—'}</td>
                <td><strong>${b.status || '—'}</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  if (selectedTypes.includes('pm') && relatedRecords.pms?.length) {
    relatedHtml += `
      <div class="section">
        <h3>Preventive Maintenance History (${relatedRecords.pms.length})</h3>
        <table>
          <thead>
            <tr>
              <th>Scheduled Due</th>
              <th>Completed Date</th>
              <th>Engineer / Agency</th>
              <th>Next Due</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${relatedRecords.pms.map((p: any) => `
              <tr>
                <td>${p.pmDueDate || '—'}</td>
                <td>${p.pmCompletionDate || '—'}</td>
                <td>${p.serviceEngineer || '—'}</td>
                <td>${p.nextPmDate || '—'}</td>
                <td><strong>${p.status || '—'}</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  if (selectedTypes.includes('calibration') && relatedRecords.calibrations?.length) {
    relatedHtml += `
      <div class="section">
        <h3>Calibration & Metrology Certificates (${relatedRecords.calibrations.length})</h3>
        <table>
          <thead>
            <tr>
              <th>Calibration Date</th>
              <th>Certificate No</th>
              <th>Calibrated By / Agency</th>
              <th>Next Due</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            ${relatedRecords.calibrations.map((c: any) => `
              <tr>
                <td>${c.calibrationDate || '—'}</td>
                <td>${c.certificateNumber || '—'}</td>
                <td>${c.calibrationAgencyPerson || '—'}</td>
                <td>${c.nextCalibrationDueDate || '—'}</td>
                <td><strong>${c.calibrationResult || '—'}</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  if (selectedTypes.includes('service') && relatedRecords.services?.length) {
    relatedHtml += `
      <div class="section">
        <h3>Service & Repair Reports (${relatedRecords.services.length})</h3>
        <table>
          <thead>
            <tr>
              <th>Service Date</th>
              <th>Service Provider</th>
              <th>Work Carried Out</th>
              <th>Spare Parts Replaced</th>
            </tr>
          </thead>
          <tbody>
            ${relatedRecords.services.map((s: any) => `
              <tr>
                <td>${s.serviceDate || '—'}</td>
                <td>${s.serviceProvider || '—'}</td>
                <td>${s.workCarriedOut || s.complaint || '—'}</td>
                <td>${s.sparePartsReplaced || '—'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  if (selectedTypes.includes('gatePass') && relatedRecords.gatePasses?.length) {
    relatedHtml += `
      <div class="section">
        <h3>Equipment Movement & Gate Passes (${relatedRecords.gatePasses.length})</h3>
        <table>
          <thead>
            <tr>
              <th>Pass No</th>
              <th>Type</th>
              <th>Date Sent</th>
              <th>Vendor / Destination</th>
              <th>Return Status</th>
            </tr>
          </thead>
          <tbody>
            ${relatedRecords.gatePasses.map((g: any) => `
              <tr>
                <td>${g.passNumber || '—'}</td>
                <td>${g.passType || '—'}</td>
                <td>${g.dateSent || '—'}</td>
                <td>${g.recipientVendor || '—'}</td>
                <td><strong>${g.returnStatus || '—'}</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  if (selectedTypes.includes('dailyRounds') && relatedRecords.dailyRounds?.length) {
    relatedHtml += `
      <div class="section">
        <h3>Daily Ward/ICU Rounds History (${relatedRecords.dailyRounds.length})</h3>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Biomedical Engineer</th>
              <th>Observations</th>
              <th>Condition</th>
            </tr>
          </thead>
          <tbody>
            ${relatedRecords.dailyRounds.map((dr: any) => `
              <tr>
                <td>${dr.date || '—'}</td>
                <td>${dr.biomedicalEngineer || '—'}</td>
                <td>${dr.observations || '—'}</td>
                <td><strong>${dr.equipmentCondition || '—'}</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Equipment Dossier - ${assetId} - ${equipName}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1e293b; padding: 24px; line-height: 1.5; font-size: 13px; }
          .header { border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-start; }
          .hospital-name { font-size: 18px; font-weight: bold; color: #0f172a; text-transform: uppercase; }
          .title { font-size: 14px; color: #2563eb; font-weight: 600; margin-top: 4px; }
          .meta { font-size: 11px; color: #64748b; font-family: monospace; }
          .specs-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; }
          .spec-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px 12px; }
          .spec-label { font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 600; }
          .spec-val { font-size: 13px; font-weight: 600; color: #0f172a; margin-top: 2px; }
          .section { margin-top: 24px; }
          .section h3 { font-size: 14px; color: #1e293b; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px; margin-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 6px; }
          th { background: #f1f5f9; text-align: left; padding: 6px 8px; border: 1px solid #e2e8f0; font-size: 10px; text-transform: uppercase; color: #475569; }
          td { padding: 6px 8px; border: 1px solid #e2e8f0; vertical-align: top; }
          .footer { margin-top: 36px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8; display: flex; justify-content: space-between; }
          @media print {
            body { padding: 0; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="hospital-name">${hospitalName || 'Biomedical Engineering Department'}</div>
            <div class="title">Comprehensive Equipment Lifecycle & Service History Dossier</div>
          </div>
          <div class="meta" style="text-align: right;">
            <div>Generated: ${new Date().toLocaleString()}</div>
            <div>Asset ID: <strong>${assetId}</strong></div>
            <div>Status: <strong>${asset.equipmentStatus || 'Active'}</strong></div>
          </div>
        </div>

        <div class="specs-grid">
          <div class="spec-card">
            <div class="spec-label">Equipment Name</div>
            <div class="spec-val">${equipName}</div>
          </div>
          <div class="spec-card">
            <div class="spec-label">Manufacturer & Model</div>
            <div class="spec-val">${asset.manufacturerBrand || '—'} / ${asset.model || '—'}</div>
          </div>
          <div class="spec-card">
            <div class="spec-label">Serial Number</div>
            <div class="spec-val" style="font-family: monospace;">${asset.serialNumber || '—'}</div>
          </div>
          <div class="spec-card">
            <div class="spec-label">Department / Location</div>
            <div class="spec-val">${asset.department || '—'} (${asset.location || '—'})</div>
          </div>
          <div class="spec-card">
            <div class="spec-label">Purchase Date / Cost</div>
            <div class="spec-val">${asset.purchaseDate || '—'} / ${asset.purchaseCost ? '$' + Number(asset.purchaseCost).toLocaleString() : '—'}</div>
          </div>
          <div class="spec-card">
            <div class="spec-label">Warranty / AMC Status</div>
            <div class="spec-val">${asset.amcCmcInfo?.type || 'Standard Warranty'} (${asset.warrantyExpiryDate || '—'})</div>
          </div>
        </div>

        ${relatedHtml || '<div style="padding: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; color: #64748b; text-align: center;">No related reports found for selected categories.</div>'}

        <div class="footer">
          <div>NABH / JCI Biomedical Equipment Management Documentation System</div>
          <div>Biomedical In-Charge Sign: _________________________</div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          }
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}

