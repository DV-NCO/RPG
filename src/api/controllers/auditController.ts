import { Request, Response } from 'express';

// Mock database - replace with actual database model
let auditEntries: any[] = [];

/**
 * Create a new audit entry
 */
export const createAuditEntry = (req: Request, res: Response) => {
    const entry = req.body;
    if (!entry) return res.status(400).send('Invalid entry');
    auditEntries.push(entry);
    res.status(201).send(entry);
};

/**
 * Get all audit entries
 */
export const getAuditEntries = (req: Request, res: Response) => {
    res.send(auditEntries);
};

/**
 * Get audit entry by ID
 */
export const getAuditEntryById = (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const entry = auditEntries.find(e => e.id === id);
    if (!entry) return res.status(404).send('Entry not found');
    res.send(entry);
};

/**
 * Update audit entry
 */
export const updateAuditEntry = (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const index = auditEntries.findIndex(e => e.id === id);
    if (index === -1) return res.status(404).send('Entry not found');
    const updatedEntry = { ...auditEntries[index], ...req.body };
    auditEntries[index] = updatedEntry;
    res.send(updatedEntry);
};

/**
 * Delete audit entry
 */
export const deleteAuditEntry = (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const index = auditEntries.findIndex(e => e.id === id);
    if (index === -1) return res.status(404).send('Entry not found');
    auditEntries.splice(index, 1);
    res.status(204).send();
};

