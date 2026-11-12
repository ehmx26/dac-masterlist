// api/check-expiry.js
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
    // Verify Vercel Cron Secret for security
    const authHeader = req.headers['authorization'];
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).json({ error: 'Unauthorized cron request' });
    }

    try {
        // Here you would connect your masterlist database or CSV
        // For demonstration, simulating the 14-day check:
        const expiringStaff = [
            { name: "Gladys Rathinavathy", doc: "Contract", expiry: "2026-11-21" },
            { name: "Samantha Barco", doc: "Visa", expiry: "2026-11-21" },
            { name: "Younan Kas Elias", doc: "Contract", expiry: "2026-11-25" }
        ];

        if (expiringStaff.length > 0) {
            const staffListHtml = expiringStaff.map(s => `<li><b>${s.name}</b> - ${s.doc} expires on ${s.expiry}</li>`).join('');

            // Send automated email to mmaktoum04@gmail.com via Resend
            const emailData = await resend.emails.send({
                from: 'Staff Expiry System <system@yourdomain.com>',
                to: 'mmaktoum04@gmail.com',
                subject: '🚨 URGENT HR ALERT: Staff Documents Expiring in 14 Days',
                html: `
                    <h2>Daily Expiry Intelligence Report</h2>
                    <p>The following staff member documents require immediate action to prevent HR compliance risks:</p>
                    <ul>${staffListHtml}</ul>
                    <p>Please log in to your dashboard to review and renew these documents.</p>
                `
            });

            return res.status(200).json({ success: true, message: 'Daily expiry alert sent successfully!', emailData });
        }

        return res.status(200).json({ success: true, message: 'No documents expiring in 14 days today.' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
