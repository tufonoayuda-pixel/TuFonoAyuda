
'use client'
import { cn } from "@/lib/utils";

const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

const generatePianoKeys = (octaveCount: number, startOctave: number) => {
    const keys = [];
    for (let octave = startOctave; octave < startOctave + octaveCount; octave++) {
        for (let i = 0; i < 12; i++) {
            const noteIndex = octave * 12 + i;
            keys.push({
                note: noteNames[i],
                octave: octave,
                type: noteNames[i].includes('#') ? 'black' : 'white',
                noteIndex: noteIndex,
            });
        }
    }
    return keys;
};

const pianoKeys = generatePianoKeys(4, 2); // Generate 4 octaves starting from octave 2

export function Piano({ activeNoteIndex }: { activeNoteIndex: number | null }) {
  
  return (
    <div className="w-full overflow-x-auto pb-2">
        <div className="flex w-[80rem] h-32 relative select-none">
            {pianoKeys.filter(k => k.type === 'white').map((key, index) => (
                <div 
                key={`white-${key.octave}-${key.note}`} 
                className={cn(
                    "relative h-full w-full border border-gray-300 rounded-b-md bg-white flex items-end justify-center pb-1",
                    activeNoteIndex === key.noteIndex && "bg-primary/30"
                )}
                >
                   {key.note === 'C' && <span className="text-xs text-muted-foreground">{key.note}{key.octave}</span>}
                </div>
            ))}
            <div className="absolute top-0 left-0 w-full h-2/3 flex">
                {pianoKeys.map((key, index) => {
                    if (key.type === 'white') return null;

                    const whiteKeyIndex = pianoKeys.filter(k => k.type === 'white').findIndex(wk => wk.noteIndex === key.noteIndex - 1);

                    return(
                         <div 
                            key={`black-${key.octave}-${key.note}`} 
                            className={cn(
                                "absolute top-0 h-full w-[2%] rounded-b-md bg-gray-800 border-2 border-gray-800 z-10",
                                activeNoteIndex === key.noteIndex && "bg-primary border-primary-foreground"
                            )}
                            style={{ left: `${(whiteKeyIndex * (100 / 28)) + (100/28 * 0.75)}%` }}
                        ></div>
                    )
                })}
            </div>
        </div>
    </div>
  );
}
