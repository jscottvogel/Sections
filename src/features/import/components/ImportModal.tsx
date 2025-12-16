import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../components/ui/Dialog';
import { Button } from '../../../components/ui/Button';
import { Loader2, Upload, CheckCircle, Bot } from 'lucide-react';
import { DocumentParser } from '../services/DocumentParser';
import type { ResumeDocument } from '../../../types';

interface ImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (data: ResumeDocument) => Promise<void>;
}

type Step = 'upload' | 'analyzing' | 'review' | 'success';

export function ImportModal({ isOpen, onClose, onImport }: ImportModalProps) {
    const [step, setStep] = useState<Step>('upload');
    const [, setFile] = useState<File | null>(null);
    const [parsedData, setParsedData] = useState<ResumeDocument | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const reset = () => {
        setStep('upload');
        setFile(null);
        setParsedData(null);
        setError(null);
    };

    /**
     * Handles the file selection and initiates the AI analysis simulation.
     */
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            startAnalysis(e.target.files[0]);
        }
    };

    /**
     * Simulates the AI Agent analysis process.
     * Transitions state from 'upload' -> 'analyzing' -> 'review'.
     */
    const startAnalysis = async (selectedFile: File) => {
        setStep('analyzing');
        setError(null);
        try {
            const result = await DocumentParser.parse(selectedFile);
            setParsedData(result);
            setStep('review');
        } catch (err: any) {
            console.error("Resume Analysis Failed:", err);
            // Enhanced error message for UI
            const msg = err.message || "Unknown error";
            setError(`Failed to analyze document. ${msg}. Check console for details.`);
            setStep('upload');
        }
    };

    const [isImporting, setIsImporting] = useState(false);

    /**
     * Finalizes the import by passing the parsed data to the parent component.
     * Closes the modal immediately on success.
     */
    const handleConfirmImport = async () => {
        if (!parsedData) return;
        setIsImporting(true);
        try {
            await onImport(parsedData);
            onClose();
            // Reset state slightly after closing to prevent UI flicker
            setTimeout(reset, 100);
        } catch (err: any) {
            console.error(err);
            setError("Failed to save import: " + err.message);
            setIsImporting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Bot className="h-5 w-5 text-indigo-600" />
                        AI Document Import
                    </DialogTitle>
                </DialogHeader>

                <div className="py-6">
                    {step === 'upload' && (
                        <div className="text-center space-y-4">
                            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                <Upload className="mx-auto h-12 w-12 text-slate-400" />
                                <p className="mt-2 text-sm text-slate-600">Click to upload resume (PDF/DOCX)</p>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept=".pdf,.docx,.doc,.txt"
                                    onChange={handleFileSelect}
                                    data-testid="file-upload"
                                />
                            </div>
                            {error && <p className="text-sm text-red-500">{error}</p>}
                        </div>
                    )}

                    {step === 'analyzing' && (
                        <div className="text-center space-y-4 py-4">
                            <div className="relative mx-auto w-16 h-16">
                                <Loader2 className="h-16 w-16 animate-spin text-indigo-600 opacity-20" />
                                <Bot className="h-8 w-8 text-indigo-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-slate-900">Analyzing Document...</h3>
                                <p className="text-sm text-slate-500">Detecting structure and extracting sections</p>
                            </div>
                        </div>
                    )}

                    {step === 'review' && parsedData && (
                        <div className="space-y-4">
                            <div className="bg-green-50 p-4 rounded-md flex items-start gap-3">
                                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-medium text-green-900">Analysis Complete</h4>
                                    <p className="text-sm text-green-700">Found <strong>{parsedData.sections.length}</strong> sections in {parsedData.document.source?.filename}</p>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-md text-sm text-slate-700 space-y-2">
                                <p><strong>Name:</strong> {parsedData.profile.name.full}</p>
                                <p><strong>Headline:</strong> {parsedData.profile.headline}</p>
                                <div className="border-t border-slate-200 pt-2 mt-2">
                                    <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Sections Detected</p>
                                    <ul className="list-disc list-inside">
                                        {parsedData.sections.map(s => (
                                            <li key={s.id}>{s.label} <span className="text-xs text-slate-400">({s.type})</span></li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="text-center py-8">
                            <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
                            <h3 className="text-xl font-medium text-slate-900">Import Successful!</h3>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    {step === 'upload' && (
                        <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    )}
                    {step === 'review' && (
                        <div className="flex flex-col gap-2 w-full">
                            {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                            <div className="flex justify-end gap-2">
                                <Button variant="ghost" onClick={reset} disabled={isImporting}>Back</Button>
                                <Button onClick={handleConfirmImport} disabled={isImporting}>
                                    {isImporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {isImporting ? 'Importing...' : 'Import Data'}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
