import { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmModal = ({
    isOpen,
    title = 'Are you sure?',
    message = 'Please confirm that you want to continue.',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    loading = false,
    variant = 'primary',
}) => {
    useEffect(() => {
        if (!isOpen) return undefined;

        const handleKeyDown = (event) => {
            if (event.key === 'Escape' && !loading) onCancel?.();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, loading, onCancel]);

    if (!isOpen) return null;

    const confirmClass =
        variant === 'danger'
            ? 'bg-red-600 hover:bg-red-700 focus-visible:ring-red-200'
            : 'bg-[#6366F1] hover:bg-[#4F46E5] focus-visible:ring-indigo-200';

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !loading) onCancel?.();
            }}
            role="presentation"
        >
            <div
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="confirm-modal-title"
                aria-describedby="confirm-modal-description"
                className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            >
                <div className="flex items-start gap-4">
                    <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${variant === 'danger'
                                ? 'bg-red-50 text-red-600'
                                : 'bg-indigo-50 text-[#6366F1]'
                            }`}
                    >
                        <AlertTriangle size={24} />
                    </div>

                    <div className="min-w-0 flex-1 pt-1">
                        <h2 id="confirm-modal-title" className="text-lg font-bold text-[#111827]">
                            {title}
                        </h2>
                        <p id="confirm-modal-description" className="mt-2 text-sm leading-6 text-gray-500">
                            {message}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        aria-label="Close confirmation dialog"
                        className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {cancelText}
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition focus-visible:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-60 ${confirmClass}`}
                    >
                        {loading && (
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        )}
                        {loading ? 'Please wait...' : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;