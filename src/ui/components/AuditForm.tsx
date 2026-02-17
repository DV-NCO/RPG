import React from 'react';

const AuditForm: React.FC = () => {
    return (
        <div>
            <h1>Website Audit Form</h1>
            <form>
                <div>
                    <label htmlFor="website-url">Website URL:</label>
                    <input type="url" id="website-url" name="website-url" required />
                </div>
                <div>
                    <label htmlFor="audit-date">Audit Date:</label>
                    <input type="date" id="audit-date" name="audit-date" required />
                </div>
                <div>
                    <label htmlFor="audit-notes">Notes:</label>
                    <textarea id="audit-notes" name="audit-notes" rows={4} required></textarea>
                </div>
                <button type="submit">Submit</button>
            </form>
        </div>
    );
};

export default AuditForm;