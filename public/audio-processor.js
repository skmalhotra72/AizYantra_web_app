// Audio Worklet Processor for OpenAI Realtime API
// This processes audio in real-time at 24kHz sample rate

class AudioProcessor extends AudioWorkletProcessor {
    constructor() {
      super()
      this.bufferSize = 2400 // 100ms at 24kHz
      this.buffer = new Int16Array(this.bufferSize)
      this.bufferIndex = 0
    }
  
    process(inputs, outputs, parameters) {
      const input = inputs[0]
      
      if (!input || !input[0]) {
        return true
      }
  
      const samples = input[0]
      
      // Convert Float32 audio to Int16
      for (let i = 0; i < samples.length; i++) {
        // Clamp to [-1, 1] and convert to Int16
        const sample = Math.max(-1, Math.min(1, samples[i]))
        this.buffer[this.bufferIndex++] = Math.round(sample * 32767)
        
        // Send buffer when full
        if (this.bufferIndex >= this.bufferSize) {
          this.port.postMessage(this.buffer.slice(0, this.bufferIndex))
          this.bufferIndex = 0
        }
      }
      
      return true
    }
  }
  
  registerProcessor('audio-processor', AudioProcessor)