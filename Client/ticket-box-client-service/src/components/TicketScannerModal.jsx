import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, RefreshCw, Loader2, CheckCircle, XCircle, ShieldAlert } from 'lucide-react';
import { useValidateTicketMutation } from '../hooks/useApproverHook';
import { toast } from 'sonner';

const TicketScannerModal = ({ onClose }) => {
    const scannerRef = useRef(null);
    const [scannerInstance, setScannerInstance] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const [cameras, setCameras] = useState([]);
    const [selectedCameraId, setSelectedCameraId] = useState(null);
    const [validationResult, setValidationResult] = useState(null);
    const validateMutation = useValidateTicketMutation();

    useEffect(() => {
        // Get available cameras
        Html5Qrcode.getCameras().then(devices => {
            if (devices && devices.length > 0) {
                setCameras(devices);
                // Default to back camera if available
                const backCamera = devices.find(d => d.label.toLowerCase().includes('back'));
                setSelectedCameraId(backCamera ? backCamera.id : devices[0].id);
            }
        }).catch(err => {
            console.error("Error getting cameras", err);
            toast.error("Could not access camera devices");
        });

        return () => {
            if (scannerInstance) {
                scannerInstance.stop().catch(err => console.error("Error stopping scanner", err));
            }
        };
    }, []);

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    const startScanner = async (cameraId) => {
        if (!cameraId) return;

        try {
            const html5QrCode = new Html5Qrcode("scanner-region");
            setScannerInstance(html5QrCode);
            setIsScanning(true);
            setValidationResult(null);

            await html5QrCode.start(
                { deviceId: cameraId },
                {
                    fps: 25,
                    qrbox: (viewfinderWidth, viewfinderHeight) => {
                        const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
                        const qrboxSize = Math.floor(minEdge * 0.75);
                        return { width: qrboxSize, height: qrboxSize };
                    },
                    aspectRatio: 1.0,
                    videoConstraints: {
                        focusMode: 'continuous',
                        whiteBalanceMode: 'continuous',
                        width: { min: 640, ideal: 1280, max: 1920 },
                        height: { min: 480, ideal: 720, max: 1080 },
                    }
                },
                async (decodedText, result) => {
                    const region = document.getElementById('scanner-region');
                    if (region) {
                        region.style.filter = 'brightness(1.5) contrast(1.2)';
                        setTimeout(() => { region.style.filter = 'none'; }, 80);
                    }

                    try {
                        await html5QrCode.stop();
                    } catch (e) {
                        console.warn("Scanner stop failed", e);
                    }
                    setIsScanning(false);
                    processValidation(decodedText);
                },
                (errorMessage) => {
                    // Not a success, common while scanning
                }
            );
        } catch (err) {
            console.error("Scanner start error", err);
            toast.error("Failed to start camera");
            setIsScanning(false);
        }
    };

    const handleManualCapture = () => {
        if (!isScanning || !scannerInstance) return;

        // Trigger a visual flash effect
        const region = document.getElementById('scanner-region');
        if (region) {
            region.style.opacity = '0.4';
            setTimeout(() => { region.style.opacity = '1'; }, 100);
        }

        captureFrameAndValidate(scannerInstance);
    };

    const captureFrameAndValidate = async (instance) => {
        try {
            const videoElement = document.querySelector('#scanner-region video');
            if (!videoElement) return;

            const baseCanvas = document.createElement('canvas');
            baseCanvas.width = videoElement.videoWidth;
            baseCanvas.height = videoElement.videoHeight;
            const baseCtx = baseCanvas.getContext('2d');
            baseCtx.drawImage(videoElement, 0, 0, baseCanvas.width, baseCanvas.height);

            const attemptDecode = async (cvs) => {
                return new Promise((resolve) => {
                    cvs.toBlob(async (blob) => {
                        if (!blob) return resolve(null);
                        try {
                            const decoded = await instance.scanFile(blob, false);
                            resolve(decoded);
                        } catch (e) {
                            resolve(null);
                        }
                    }, 'image/jpeg', 0.9);
                });
            };

            // Pass 1: Original
            let decodedText = await attemptDecode(baseCanvas);

            // Pass 2: Flipped (Horizontal)
            if (!decodedText) {
                const flipCanvas = document.createElement('canvas');
                flipCanvas.width = baseCanvas.width;
                flipCanvas.height = baseCanvas.height;
                const fctx = flipCanvas.getContext('2d');
                fctx.scale(-1, 1);
                fctx.drawImage(baseCanvas, -baseCanvas.width, 0);
                decodedText = await attemptDecode(flipCanvas);
            }

            // Pass 3: Sharpened + Grayscale
            if (!decodedText) {
                const highCtxCanvas = document.createElement('canvas');
                highCtxCanvas.width = baseCanvas.width;
                highCtxCanvas.height = baseCanvas.height;
                const hctx = highCtxCanvas.getContext('2d');
                hctx.filter = 'contrast(1.6) grayscale(1.0) brightness(1.1)';
                hctx.drawImage(baseCanvas, 0, 0);
                decodedText = await attemptDecode(highCtxCanvas);
            }

            // Pass 4: Center Crop (Zoom in effect)
            if (!decodedText) {
                const cropCanvas = document.createElement('canvas');
                const size = Math.min(baseCanvas.width, baseCanvas.height) * 0.6;
                cropCanvas.width = size;
                cropCanvas.height = size;
                const cctx = cropCanvas.getContext('2d');
                cctx.drawImage(
                    baseCanvas,
                    (baseCanvas.width - size) / 2, (baseCanvas.height - size) / 2, size, size,
                    0, 0, size, size
                );
                decodedText = await attemptDecode(cropCanvas);
            }

            // Pass 5: Center Crop + Flip
            if (!decodedText) {
                const cropFlipCanvas = document.createElement('canvas');
                const size = Math.min(baseCanvas.width, baseCanvas.height) * 0.6;
                cropFlipCanvas.width = size;
                cropFlipCanvas.height = size;
                const cfctx = cropFlipCanvas.getContext('2d');
                cfctx.scale(-1, 1);
                cfctx.drawImage(
                    baseCanvas,
                    (baseCanvas.width - size) / 2, (baseCanvas.height - size) / 2, size, size,
                    -size, 0, size, size
                );
                decodedText = await attemptDecode(cropFlipCanvas);
            }

            // Pass 6: "Silicon Vision" (Binary Thresholding for Screens)
            // This fixes the "white bleed" when scanning a bright mobile screen from a laptop
            if (!decodedText) {
                const binaryCanvas = document.createElement('canvas');
                binaryCanvas.width = baseCanvas.width;
                binaryCanvas.height = baseCanvas.height;
                const bctx = binaryCanvas.getContext('2d');
                bctx.filter = 'contrast(2.5) grayscale(1.0) brightness(0.8) blur(0.5px)';
                bctx.drawImage(baseCanvas, 0, 0);
                decodedText = await attemptDecode(binaryCanvas);
            }

            if (decodedText) {
                try {
                    await instance.stop();
                } catch (e) {
                    console.warn("Scanner stop failed", e);
                }
                setIsScanning(false);
                processValidation(decodedText);
            } else {
                toast.error("Vision AI failed to lock. Stabilize optics and adjust screen brightness.");
            }

        } catch (err) {
            console.error("Hyper-scan error", err);
            toast.error("Internal processing error");
        }
    };

    const processValidation = async (token) => {
        try {
            const result = await validateMutation.mutateAsync(token);
            setValidationResult({ success: true, data: result });
            toast.success("Ticket validated successfully!");
        } catch (error) {
            let userFriendlyMessage = error.message;
            const fullError = error.response?.data?.message || error.message;

            if (fullError.includes("NotFoundException") || fullError.includes("400") || fullError.includes("Invalid Ticket Token")) {
                userFriendlyMessage = "QR Validation Failed: The token is invalid or does not exist in the system manifest.";
            } else if (fullError.includes("USED") || fullError.includes("already been scanned")) {
                userFriendlyMessage = "Validation Error: This ticket has already been used and is no longer valid for entry.";
            } else if (fullError.includes("403")) {
                userFriendlyMessage = "Unauthorized: Security matrix denied validation for this device.";
            }

            setValidationResult({ success: false, message: userFriendlyMessage });
        }
    };

    const resetScanner = () => {
        setValidationResult(null);
        startScanner(selectedCameraId);
    };

    useEffect(() => {
        if (selectedCameraId && !isScanning && !validationResult) {
            startScanner(selectedCameraId);
        }
    }, [selectedCameraId]);

    const switchCamera = () => {
        if (cameras.length < 2) return;
        const currentIndex = cameras.findIndex(c => c.id === selectedCameraId);
        const nextIndex = (currentIndex + 1) % cameras.length;
        setSelectedCameraId(cameras[nextIndex].id);

        if (scannerInstance) {
            scannerInstance.stop().then(() => {
                startScanner(cameras[nextIndex].id);
            });
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-2xl">
            <div className="relative w-full max-w-xl overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#0d1117] shadow-2xl ring-1 ring-white/20">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/5 p-8">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                            <Camera className="h-6 w-6" />
                        </div>
                        <h2 className="text-2xl font-black uppercase tracking-tighter text-white">Entry Validator</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 text-gray-500 hover:bg-white/10 hover:text-white transition-all active:scale-95"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-10">
                    <div className="relative aspect-square w-full overflow-hidden rounded-[2rem] bg-gray-900 ring-1 ring-white/10 shadow-inner">
                        <style>{`
                            #scanner-region {
                                width: 100% !important;
                                height: 100% !important;
                                position: relative;
                            }
                            #scanner-region video {
                                width: 100% !important;
                                height: 100% !important;
                                object-fit: cover !important;
                                transform: ${isMobile ? 'none' : 'scaleX(-1)'}; /* Flip camera for PC webcam, keep normal for mobile back cam */
                            }
                            #scanner-region img {
                                display: none !important; /* Hide html5-qrcode's default decorative image */
                            }
                        `}</style>
                        <div id="scanner-region" className="h-full w-full" />

                        {/* Validation Overlays */}
                        {validateMutation.isPending && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                                <Loader2 className="h-16 w-16 animate-spin text-blue-500" />
                                <span className="mt-4 text-xs font-black uppercase tracking-[0.2em] text-white">Verifying Token...</span>
                            </div>
                        )}

                        {validationResult && (
                            <div className={`absolute inset-0 flex flex-col items-center justify-center backdrop-blur-md animate-in zoom-in duration-500 ${validationResult.success ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`}>
                                {validationResult.success ? (
                                    <>
                                        <div className="h-24 w-24 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-2xl shadow-emerald-500/50 mb-6">
                                            <CheckCircle className="h-14 w-14" />
                                        </div>
                                        <h3 className="text-2xl font-black uppercase tracking-tighter text-white">Access Granted</h3>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mt-2">Proceed to entrance</p>
                                    </>
                                ) : (
                                    <>
                                        <div className="h-24 w-24 rounded-full bg-rose-500 flex items-center justify-center text-white shadow-2xl shadow-rose-500/50 mb-6">
                                            <ShieldAlert className="h-14 w-14" />
                                        </div>
                                        <h3 className="text-2xl font-black uppercase tracking-tighter text-white">Access Denied</h3>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-rose-400 mt-2 px-8 text-center">{validationResult.message || "Invalid or tampered ticket token"}</p>
                                    </>
                                )}

                                <button
                                    onClick={resetScanner}
                                    className="mt-12 group flex items-center gap-3 rounded-2xl bg-white px-8 py-4 text-[10px] font-black uppercase tracking-widest text-black shadow-2xl transition-all hover:bg-blue-500 hover:text-white active:scale-95"
                                >
                                    <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
                                    Scan Next Request
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Footer / Controls */}
                    {!validationResult && (
                        <div className="mt-10 flex flex-col items-center gap-8">
                            <button
                                onClick={handleManualCapture}
                                disabled={!isScanning || validateMutation.isPending}
                                className="flex items-center gap-3 rounded-2xl bg-blue-500 px-10 py-5 text-xs font-black uppercase tracking-[0.2em] text-white shadow-2xl shadow-blue-500/40 transition-all hover:bg-blue-600 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                            >
                                <Camera className="h-5 w-5" />
                                Initiate Manual Capture
                            </button>

                            <div className="flex flex-col items-center gap-4">
                                <div className="flex items-center gap-4">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Optics Signal Strength</p>
                                    <div className="h-1 w-24 rounded-full bg-white/5 overflow-hidden">
                                        <div className="h-full bg-blue-500 w-1/2 animate-pulse" />
                                    </div>
                                </div>

                                {cameras.length > 1 && (
                                    <button
                                        onClick={switchCamera}
                                        className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors"
                                    >
                                        <RefreshCw className="h-4 w-4" />
                                        Switch Optics Matrix
                                    </button>
                                )}
                            </div>

                            {/* Scanning Tips */}
                            <div className="mt-4 flex flex-col items-center p-6 border border-white/5 rounded-3xl bg-white/5 w-full">
                                <div className="flex items-center gap-3 mb-4">
                                    <ShieldAlert className="h-4 w-4 text-amber-500/50" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Precision Guidelines</span>
                                </div>
                                <ul className="text-[9px] font-medium text-gray-500 uppercase tracking-widest flex flex-col gap-2">
                                    <li>• Stabilize optics on target</li>
                                    <li>• Ensure neutral lighting conditions</li>
                                    <li>• Position QR within digital grid</li>
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TicketScannerModal;
