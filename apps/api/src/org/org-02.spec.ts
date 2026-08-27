import { describe, expect, it } from 'vitest';
import { EmployeeService } from './employee.service';

describe('ORG-02 EmployeeAssignment historis — no overlap', () => {
  it('tidak overlap: assignment berurutan valid', () => {
    const existing = [
      { effectiveFrom: new Date('2024-01-01'), effectiveTo: new Date('2024-06-01') },
    ];
    const newFrom = new Date('2024-06-01');
    const newTo = new Date('2024-12-01');
    expect(EmployeeService.isOverlapping(existing, newFrom, newTo)).toBe(false);
  });

  it('overlap: newFrom di tengah existing', () => {
    const existing = [
      { effectiveFrom: new Date('2024-01-01'), effectiveTo: new Date('2024-06-01') },
    ];
    const newFrom = new Date('2024-03-01');
    const newTo = new Date('2024-09-01');
    expect(EmployeeService.isOverlapping(existing, newFrom, newTo)).toBe(true);
  });

  it('overlap: newTo null (current) bentrok dengan existing current', () => {
    const existing = [
      { effectiveFrom: new Date('2024-01-01'), effectiveTo: null }, // current
    ];
    const newFrom = new Date('2024-02-01');
    const newTo = null;
    expect(EmployeeService.isOverlapping(existing, newFrom, newTo)).toBe(true);
  });

  it('tidak overlap: existing current, new assignment sebelum existing', () => {
    const existing = [
      { effectiveFrom: new Date('2024-06-01'), effectiveTo: null },
    ];
    const newFrom = new Date('2024-01-01');
    const newTo = new Date('2024-05-01');
    expect(EmployeeService.isOverlapping(existing, newFrom, newTo)).toBe(false);
  });

  it('overlap: new assignment sepenuhnya di dalam existing', () => {
    const existing = [
      { effectiveFrom: new Date('2024-01-01'), effectiveTo: new Date('2024-12-31') },
    ];
    const newFrom = new Date('2024-03-01');
    const newTo = new Date('2024-04-01');
    expect(EmployeeService.isOverlapping(existing, newFrom, newTo)).toBe(true);
  });

  it('historis valid: multiple assignments tidak overlap', () => {
    const existing = [
      { effectiveFrom: new Date('2023-01-01'), effectiveTo: new Date('2023-06-01') },
      { effectiveFrom: new Date('2023-06-01'), effectiveTo: new Date('2023-12-01') },
    ];
    const newFrom = new Date('2024-01-01');
    const newTo = null;
    expect(EmployeeService.isOverlapping(existing, newFrom, newTo)).toBe(false);
  });
});
