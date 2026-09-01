'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Database, Download, Loader2 } from 'lucide-react';
import BrandLogo from '../../components/BrandLogo';

export default function ExportPage() {
  const [database, setDatabase] = useState('all');
  const [databaseNames, setDatabaseNames] = useState<string[]>([]);
  const [isLoadingDatabases, setIsLoadingDatabases] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDatabases = async () => {
      try {
        const response = await fetch('/api/databases');
        const body = await response.json();

        if (!response.ok) {
          throw new Error(body.error || 'Unable to load databases.');
        }

        const loadedDatabases = body.databases || [];
        setDatabaseNames(loadedDatabases);
        setDatabase(loadedDatabases.includes('merabetta') ? 'merabetta' : loadedDatabases[0] || 'all');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load databases.');
      } finally {
        setIsLoadingDatabases(false);
      }
    };

    loadDatabases();
  }, []);

  const handleExport = async () => {
    setIsExporting(true);
    setError('');

    try {
      const response = await fetch(`/api/export-xlsx?database=${encodeURIComponent(database)}`);
      const contentType = response.headers.get('content-type') || '';

      if (!response.ok) {
        if (contentType.includes('application/json')) {
          const body = await response.json();
          throw new Error(body.error || 'Export failed.');
        }
        throw new Error('Export failed.');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const filename = response.headers
        .get('content-disposition')
        ?.match(/filename="([^"]+)"/)?.[1] || 'mongodb_export.xlsx';

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FFF8F3] px-4 py-6 text-slate-900">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
        <header className="flex items-center justify-between rounded-xl border border-orange-100 bg-white px-4 py-3 shadow-sm">
          <BrandLogo />
          <Link
            href="/"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Enrollment Form
          </Link>
        </header>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-6 flex items-start gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-teal-50 text-teal-700">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-950">MongoDB XLSX Export</h1>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Download MongoDB collections as an Excel workbook.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">Database</span>
              <select
                value={database}
                onChange={(event) => setDatabase(event.target.value)}
                disabled={isLoadingDatabases || isExporting || databaseNames.length === 0}
                className="h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
              >
                <option value="all">
                  {isLoadingDatabases ? 'Loading databases...' : 'All databases'}
                </option>
                {databaseNames.map((databaseName) => (
                  <option key={databaseName} value={databaseName}>
                    {databaseName}
                  </option>
                ))}
              </select>
            </label>

            {error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={handleExport}
              disabled={isExporting || isLoadingDatabases || databaseNames.length === 0}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-teal-700 px-5 text-sm font-extrabold text-white shadow-sm transition hover:bg-teal-800 disabled:cursor-wait disabled:opacity-70"
            >
              {isExporting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Download className="h-5 w-5" />
              )}
              {isExporting ? 'Preparing Download' : 'Export XLSX'}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
