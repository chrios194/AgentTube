"use client";

interface TranscriptionProps {
  videoId: string;
}

const Transcription = ({ videoId }: TranscriptionProps) => {
  void videoId;
  return (
    <div className="border p-4 rounded-xl gap-3 flex flex-col">
      <h3 className="font-medium">Transcription temporarily unavailable</h3>
      <p className="text-sm text-muted-foreground">
        Transcript retrieval is disabled while this app replaces its previous
        non-official source with a compliant, authorized captions workflow.
        No transcript is fetched or stored by this feature.
      </p>
    </div>
  );
};

export default Transcription;
