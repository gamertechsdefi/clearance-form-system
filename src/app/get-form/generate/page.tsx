'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import html2canvas from 'html2canvas';

type FormData = {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
  };
  academicInfo: {
    institutionType: 'mapoly' | 'other' | '';
    department: string;
    level: string;
    matricNumber: string;
    school: string;
  };
  clearanceInfo: {
    reason: string;
    dateNeeded: string;
    images: (string | null)[];
  };
};

function ClearanceFormInner() {
  const [formData, setFormData] = useState<FormData | null>(null);

  // Refs for capture and preview
  const captureRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const searchParams = useSearchParams();

  type Pos = { top: number; left: number; width?: number; height?: number };
  type Positions = {
    name: Pos;
    department: Pos;
    matricNo: Pos;
    school: Pos;
    level: Pos;
    tellerNo: Pos;
  };

  const defaultPositions: Positions = {
    name: { top: 23.6, left: 23.5 },
    department: { top: 28.3, left: 28.5 },
    matricNo: { top: 28.3, left: 76.5 },
    school: { top: 33.6, left: 21.0 },
    level: { top: 37.7, left: 21.0 },
    tellerNo: { top: 37.7, left: 62.0 },
  };

  const [positions, setPositions] = useState<Positions>(defaultPositions);
  const [showAdjust, setShowAdjust] = useState(false);
  const [showGuides, setShowGuides] = useState(false);

  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const raw = localStorage.getItem('overlayPositions:v2');
      if (raw) {
        const parsed = JSON.parse(raw) as Positions;
        if (parsed && parsed.name && typeof parsed.name.top === 'number') {
          setPositions(parsed);
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      localStorage.setItem('overlayPositions:v2', JSON.stringify(positions));
    } catch {}
  }, [positions]);

  useEffect(() => {
    const matricNumber = searchParams.get('matricNumber');
    if (matricNumber) {
      const storedData = localStorage.getItem(`formData-${matricNumber}`);
      if (storedData) {
        setFormData(JSON.parse(storedData));
      }
    }
  }, [searchParams]);

  const containerStyle = useMemo<React.CSSProperties>(() => ({
    position: 'relative',
    width: '923px',
    height: '611px',
    margin: '0 auto',
  }), []);

  const OverlayItem = ({ children, top, left, width, height }: Pos & { children: React.ReactNode }) => (
    <div
      style={{
        position: 'absolute',
        top: `${top}%`,
        left: `${left}%`,
        width: width ? `${width}%` : 'auto',
        height: height ? `${height}%` : 'auto',
        fontSize: '17px',
        fontWeight: 500,
        letterSpacing: '0.2px',
        whiteSpace: 'nowrap',
        color: '#1f2937',
      }}
      className="text-gray-900"
    >
      {children}
    </div>
  );

  const generateCanvas = async () => {
    if (!captureRef.current || !previewRef.current) return;
    const canvas = await html2canvas(captureRef.current, { useCORS: true, backgroundColor: null });
    previewRef.current.innerHTML = '';
    previewRef.current.appendChild(canvas);
    previewRef.current.classList.remove('hidden');
  };

  const downloadPng = async () => {
    if (!captureRef.current) return;
    const canvas = await html2canvas(captureRef.current, { useCORS: true, backgroundColor: null });
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'clearance-form.png';
    link.click();
  };

  if (!formData) {
    return <div>x</div>;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Clearance Form Preview</h1>

      <div ref={captureRef} style={containerStyle} className="shadow rounded overflow-hidden bg-white">
        <img
          src="/images/form.jpg"
          alt="Clearance form template"
          className="w-full h-full object-fill select-none pointer-events-none"
          draggable={false}
        />

        {showGuides && (
          <>
            {Object.values(positions).flatMap((p, i) => 
              Array.isArray(p) ? p.map((pos, j) => <div key={`guide-${i}-${j}`} style={{ position: 'absolute', top: `${pos.top}%`, left: 0, right: 0, height: 0, borderTop: '1px dashed rgba(59,130,246,0.6)' }} />) : <div key={`guide-${i}`} style={{ position: 'absolute', top: `${p.top}%`, left: 0, right: 0, height: 0, borderTop: '1px dashed rgba(59,130,246,0.6)' }} />
            )}
          </>
        )}

        <OverlayItem top={positions.name.top} left={positions.name.left}>{`${formData.personalInfo.firstName} ${formData.personalInfo.lastName}`}</OverlayItem>
        <OverlayItem top={positions.department.top} left={positions.department.left}>{formData.academicInfo.department}</OverlayItem>
        <OverlayItem top={positions.matricNo.top} left={positions.matricNo.left}>{formData.academicInfo.matricNumber}</OverlayItem>
        <OverlayItem top={positions.school.top} left={positions.school.left}>{formData.academicInfo.school}</OverlayItem>
        <OverlayItem top={positions.level.top} left={positions.level.left}>{formData.academicInfo.level}</OverlayItem>
        <OverlayItem top={positions.tellerNo.top} left={positions.tellerNo.left}>GeneratedTellerNo</OverlayItem>

        {/* {formData.clearanceInfo.images.map((image, index) => 
          image && positions.images[index] && (
            <OverlayItem key={`image-${index}`} {...positions.images[index]}>
              <img src={image} alt={`uploaded-${index}`} className="w-full h-full object-contain" />
            </OverlayItem>
          )
        )} */}
       </div>

      <div className="flex items-center gap-3 mt-6">
        <button onClick={generateCanvas} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Generate Canvas Preview
        </button>
        <button onClick={downloadPng} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
          Download PNG
        </button>
        <button onClick={() => setShowAdjust(v => !v)} className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800">
          {showAdjust ? 'Hide Adjustments' : 'Adjust Positions'}
        </button>
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={showGuides} onChange={(e) => setShowGuides(e.target.checked)} />
          Show guides
        </label>
      </div>

      {showAdjust && (
        <div className="mt-4 p-4 border rounded bg-white max-w-[923px]">
          <h2 className="font-semibold mb-2">Fine-tune positions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(
              [
                ['name', 'Name'],
                ['department', 'Department'],
                ['matricNo', 'Matric No'],
                ['school', 'School'],
                ['level', 'Level'],
                ['tellerNo', 'Teller No'],
              ] as ReadonlyArray<[keyof Positions, string]>
            ).map(([key, label]) => (
              <div key={key} className="border rounded p-3">
                <div className="text-sm font-medium mb-2">{label}</div>
                <div className="flex items-center gap-2">
                  <label className="text-xs w-12">Top</label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={0.1}
                    value={positions[key].top}
                    onChange={(e) =>
                      setPositions(prev => ({
                        ...prev,
                        [key]: { ...prev[key], top: parseFloat(e.target.value) },
                      }))
                    }
                    className="flex-1"
                  />
                  <span className="text-xs w-14 text-right">{positions[key].top.toFixed(1)}%</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <label className="text-xs w-12">Left</label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={0.1}
                    value={positions[key].left}
                    onChange={(e) =>
                      setPositions(prev => ({
                        ...prev,
                        [key]: { ...prev[key], left: parseFloat(e.target.value) },
                      }))
                    }
                    className="flex-1"
                  />
                  <span className="text-xs w-14 text-right">{positions[key].left.toFixed(1)}%</span>
                </div>
              </div>
            ))}
            {/* {positions.images.map((_, index) => (
              <div key={`image-pos-${index}`} className="border rounded p-3">
                <div className="text-sm font-medium mb-2">Image {index + 1}</div>
                <div className="flex items-center gap-2">
                  <label className="text-xs w-12">Top</label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={0.1}
                    value={positions.images[index].top}
                    onChange={(e) => {
                      const newImages = [...positions.images];
                      newImages[index] = { ...newImages[index], top: parseFloat(e.target.value) };
                      setPositions(prev => ({ ...prev, images: newImages }));
                    }}
                    className="flex-1"
                  />
                  <span className="text-xs w-14 text-right">{positions.images[index].top.toFixed(1)}%</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <label className="text-xs w-12">Left</label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={0.1}
                    value={positions.images[index].left}
                    onChange={(e) => {
                      const newImages = [...positions.images];
                      newImages[index] = { ...newImages[index], left: parseFloat(e.target.value) };
                      setPositions(prev => ({ ...prev, images: newImages }));
                    }}
                    className="flex-1"
                  />
                  <span className="text-xs w-14 text-right">{positions.images[index].left.toFixed(1)}%</span>
                </div>
              </div>
            ))} */}
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setPositions(defaultPositions)}
              className="px-3 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300"
            >
              Reset to defaults
            </button>
          </div>
        </div>
      )}

      <div ref={previewRef} id="preview" className="mt-6 hidden" />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <ClearanceFormInner />
    </Suspense>
  );
}
