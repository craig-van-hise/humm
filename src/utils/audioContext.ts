import * as Tone from 'tone';

/**
 * Ensures the Web Audio API context is unlocked for mobile browser autoplay policies
 */
export async function unlockAudioContext(): Promise<boolean> {
  try {
    if (Tone.getContext().state !== 'running') {
      await Tone.start();
    }
    return Tone.getContext().state === 'running';
  } catch (error) {
    console.warn('Audio Context unlock error:', error);
    return false;
  }
}
