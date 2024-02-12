import * as Dialog from '@radix-ui/react-dialog';
import { X } from "lucide-react";
import { ChangeEvent, FormEvent, useState } from 'react';
import { toast } from 'sonner';

let speechRecognition: SpeechRecognition | null = null

interface NewNoteCardProps {
  onNoteCreated: (content: string) => void
}

export const NewNoteCard = ({ onNoteCreated } : NewNoteCardProps)  => {
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(true);
  const [content, setContent] = useState('');
  const [isRecording, setIsRecording] = useState(false)

  const handleStartEditor = () => {
    setShouldShowOnboarding(false);
  };

  const handleContentChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setContent(event.target.value)
    if (event.target.value === '') {
      setShouldShowOnboarding(true)
    }
  };

  const handleSaveNote = (e: FormEvent) => {
    e.preventDefault();

    if (content === '') {
      return
    }
      

    onNoteCreated(content)
    setContent('')
    setShouldShowOnboarding(true)
    toast.success('Nota salva com sucesso !')
  };

  const handleStartRecording = () => {

    const isSpeechRecognitionAPIAvailable = 'SpeechRecognition' in window 
    || 'webkitSpeechRecognition' in window

    if (!isSpeechRecognitionAPIAvailable) {
      alert('Infelizmente seu navegador não suporta a API de gravação !')
      return
    }

    setIsRecording(true)
    setShouldShowOnboarding(false)

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

    speechRecognition = new SpeechRecognition()

    speechRecognition.lang = 'pt-BR'
    speechRecognition.continuous = true
    speechRecognition.maxAlternatives = 1
    speechRecognition.interimResults = true

    speechRecognition.onresult = (event) => {
      const transcription = Array.from(event.results).reduce((text, result) => {
          return text.concat(result[0].transcript)
      },'') 

      setContent(transcription)
    }

    speechRecognition.onerror = (event) => {
      console.log(event)
    }

    speechRecognition.start()

  };

  const handleStopRecording = () => {
    setIsRecording(false)

    if (speechRecognition !== null) {
      speechRecognition.stop()
    }
    
  };
   
  return (
      <Dialog.Root>
        <Dialog.DialogTrigger className="rounded-md text-left bg-slate-700 flex flex-col p-5 gap-3 hover:ring-2 hover:ring-slate-600 focus-visible:ring-2 focus-visible:ring-lime-400 outline-none overflow-hidden">
          <span className="text-sm font-medium text-slate-200">
            Adicionar nota
          </span>
          <p className="text-sm leading-6 text-slate-400">
            Comece gravando uma nota em áudio ou se preferir apenas texto.
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/60 to-black/0 pointer-events-none"/>
        </Dialog.DialogTrigger>

        <Dialog.Portal>
          <Dialog.Overlay className="inset-8 fixed bg-black/50"/>
            <Dialog.Content className="fixed overflow-hidden inset-0 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-[640px] w-full md:h-[60vh] bg-slate-700 md:rounded-md flex flex-col outline-none">
              <Dialog.Close className="absolute right-0 top-0 bg-slate-800 p-1.5 text-slate-400 hover:text-slate-100">
                <X className="size-5"/>
              </Dialog.Close>
              <form className='flex flex-1 flex-col'>
                <div className='flex flex-1 flex-col gap-3 p-5'>
                  <span className="text-sm font-medium text-slate-300">
                    Adicionar nota
                  </span>

                  {shouldShowOnboarding ? (
                    <p className="text-sm leading-6 text-slate-400">
                      Comece {" "}<button type="button" onClick={handleStartRecording} className='font-medium text-lime-400 hover:underline'>gravando uma nota </button> {" "} em áudio ou se preferir ou se preferir {" "}<button type="button" onClick={handleStartEditor} className='font-medium text-lime-400 hover:underline'>utilize apenas texto</button>.
                    </p>
                  ) : (
                    <textarea 
                      autoFocus 
                      className='text-sm leading-6 text-slate-400 bg-transparent resize-none flex-1 outline-none'
                      onChange={handleContentChange}
                      value={content}
                    />
                  )}
                
                    {/* <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/60 to-black/0 pointer-events-none"/> */}
                </div>

                {isRecording ? (
                    <button 
                      type='button'
                      className="w-full flex items-center justify-center gap-2 bg-slate-900 py-4 text-center text-sm text-slate-300 outline-none font-medium hover:text-slate-100"
                      onClick={handleStopRecording}
                    >
                      <div className='size-3 rounded-full bg-red-500 animate-pulse'/>
                      Gravando ! (clique p/ interroper)
                    </button>
                ) : (
                    <button 
                      type='button'
                      className="w-full bg-lime-400 py-4 text-center text-sm text-lime-950 outline-none font-medium hover:bg-lime-500"
                      onClick={handleSaveNote}
                    >
                      Salvar nota
                    </button>
                )}

              
              </form>
             
            </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>        
  )
};