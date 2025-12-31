import React, { useState, useEffect } from 'react';
import { certificateAPI } from '../services/apiService';
import { Certificate } from '../types';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from './ToastContainer';
import { LoadingSpinner, EmptyState, PageState } from './Loading';

interface CertificatesComponentProps {
  userId?: string;
}

const CertificatesComponent: React.FC<CertificatesComponentProps> = ({ userId }) => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    loadCertificates();
  }, [userId]);

  const loadCertificates = async () => {
    setLoading(true);
    try {
      const { data, error } = await certificateAPI.getUserCertificates(userId);
      if (error) {
        addToast(error, 'error');
      } else if (data) {
        setCertificates(
          Array.isArray(data)
            ? data
            : (data && typeof data === 'object' && 'certificates' in data && Array.isArray((data as any).certificates))
              ? (data as { certificates: Certificate[] }).certificates
              : []
        );
      }
    } catch (error) {
      addToast('Failed to load certificates', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCertificate = async (certificateId: string) => {
    setVerifying(true);
    try {
      const { data, error } = await certificateAPI.verifyCertificate(certificateId);
      if (error) {
        addToast(error, 'error');
        setVerificationResult({ valid: false, message: error });
      } else if (data) {
        setVerificationResult(data);
        addToast('Certificate verified successfully', 'success');
      }
    } catch (error) {
      addToast('Verification failed', 'error');
    } finally {
      setVerifying(false);
    }
  };

  const downloadCertificate = (certificate: Certificate) => {
    // In a real app, this would download the actual certificate PDF
    addToast('Downloading certificate...', 'info');
    // window.open(certificate.certificateUrl, '_blank');
  };

  const shareCertificate = (certificate: Certificate) => {
    const url = `${window.location.origin}${window.location.pathname}#/certificate/${certificate.certificateId}`;
    navigator.clipboard.writeText(url);
    addToast('Certificate link copied to clipboard!', 'success');
  };

  if (loading) {
    return (
      <PageState
        state="loading"
        title="Loading Certificates"
        message="Fetching your earned certificates..."
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {selectedCertificate ? (
        // Certificate Details View
        <div className="space-y-6">
          <button
            onClick={() => {
              setSelectedCertificate(null);
              setVerificationResult(null);
            }}
            className="text-indigo-600 hover:underline text-sm font-semibold mb-4"
          >
            ← Back to Certificates
          </button>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Certificate Preview */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-12 md:p-20 text-center">
              <div className="mb-8">
                <div className="text-6xl mb-4">🏆</div>
                <h1 className="text-4xl md:text-5xl font-bold text-amber-900 mb-4">
                  Certificate of Completion
                </h1>
              </div>

              <div className="space-y-6 mb-8">
                <div>
                  <p className="text-sm text-amber-700 uppercase tracking-widest">Course</p>
                  <p className="text-3xl font-bold text-amber-900">{selectedCertificate.courseTitle}</p>
                </div>

                <div className="h-px bg-amber-200"></div>

                <div>
                  <p className="text-sm text-amber-700 uppercase tracking-widest">This certificate is awarded to</p>
                  <p className="text-2xl font-semibold text-amber-900 mt-2">
                    {/* User name would come from auth context */}
                    Learner
                  </p>
                </div>

                {selectedCertificate.score && (
                  <div>
                    <p className="text-sm text-amber-700 uppercase tracking-widest">Performance</p>
                    <div className="flex justify-center items-center gap-4 mt-2">
                      <div>
                        <p className="text-3xl font-bold text-amber-900">{selectedCertificate.score}%</p>
                        <p className="text-sm text-amber-700">Score</p>
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-amber-900">{selectedCertificate.grade}</p>
                        <p className="text-sm text-amber-700">Grade</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="h-px bg-amber-200"></div>

                <div className="flex justify-between items-center text-sm text-amber-700">
                  <div>
                    <p className="uppercase tracking-widest">Issued</p>
                    <p className="font-semibold text-amber-900">
                      {new Date(selectedCertificate.issuedDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="uppercase tracking-widest">Valid Until</p>
                    <p className="font-semibold text-amber-900">
                      {new Date(selectedCertificate.validUntil).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="uppercase tracking-widest">Certificate ID</p>
                    <p className="font-mono text-sm text-amber-900">
                      {selectedCertificate.certificateId.slice(0, 8)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-amber-600 text-xs">
                Verify this certificate at: {selectedCertificate.certificateId}
              </div>
            </div>

            {/* Certificate Actions */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <button
                  onClick={() => downloadCertificate(selectedCertificate)}
                  className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-semibold text-sm"
                >
                  <span>📥</span> Download
                </button>
                <button
                  onClick={() => shareCertificate(selectedCertificate)}
                  className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm"
                >
                  <span>🔗</span> Share
                </button>
                <button
                  onClick={() => handleVerifyCertificate(selectedCertificate.certificateId)}
                  disabled={verifying}
                  className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold text-sm disabled:opacity-50"
                >
                  <span>✓</span> {verifying ? 'Verifying...' : 'Verify'}
                </button>
              </div>

              {/* Verification Result */}
              {verificationResult && (
                <div
                  className={`p-4 rounded-lg border-l-4 ${
                    verificationResult.valid
                      ? 'bg-green-50 border-green-500 text-green-700'
                      : 'bg-red-50 border-red-500 text-red-700'
                  }`}
                >
                  <p className="font-semibold mb-1">
                    {verificationResult.valid ? '✓ Certificate Verified' : '✗ Verification Failed'}
                  </p>
                  <p className="text-sm">{verificationResult.message}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : certificates.length === 0 ? (
        // Empty State
        <div className="space-y-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">My Certificates</h1>
            <p className="text-slate-600 mt-2">Track your learning achievements and earned certificates</p>
          </div>

          <EmptyState
            icon="🎓"
            title="No Certificates Yet"
            description="Complete courses and assessments to earn certificates that showcase your achievements."
            action={{
              label: 'Explore Courses',
              onClick: () => (window.location.hash = '#/courses'),
            }}
          />
        </div>
      ) : (
        // Certificates Grid
        <div className="space-y-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">My Certificates ({certificates.length})</h1>
            <p className="text-slate-600 mt-2">
              Showcase your learning achievements. Download and share your certificates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((certificate) => (
              <div
                key={certificate.certificateId}
                className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-amber-200 overflow-hidden cursor-pointer hover:border-amber-300"
                onClick={() => setSelectedCertificate(certificate)}
              >
                {/* Certificate Card */}
                <div className="p-6 text-center">
                  <div className="text-5xl mb-4">🏆</div>
                  <h3 className="text-lg font-bold text-amber-900 mb-2">
                    {certificate.courseTitle}
                  </h3>
                  <p className="text-sm text-amber-700 mb-4">
                    Issued {new Date(certificate.issuedDate).toLocaleDateString()}
                  </p>

                  <div className="grid grid-cols-2 gap-2 mb-4 text-center">
                    {certificate.score && (
                      <div className="bg-white bg-opacity-60 px-2 py-2 rounded">
                        <p className="text-lg font-bold text-amber-900">{certificate.score}%</p>
                        <p className="text-xs text-amber-700">Score</p>
                      </div>
                    )}
                    {certificate.grade && (
                      <div className="bg-white bg-opacity-60 px-2 py-2 rounded">
                        <p className="text-lg font-bold text-amber-900">{certificate.grade}</p>
                        <p className="text-xs text-amber-700">Grade</p>
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-amber-600">
                    Valid until {new Date(certificate.validUntil).toLocaleDateString()}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="bg-white bg-opacity-40 px-6 py-3 flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadCertificate(certificate);
                    }}
                    className="flex-1 text-sm text-indigo-600 hover:text-indigo-700 font-semibold"
                  >
                    Download
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      shareCertificate(certificate);
                    }}
                    className="flex-1 text-sm text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    Share
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificatesComponent;
