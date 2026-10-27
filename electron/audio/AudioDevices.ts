import { loadNativeModule } from './nativeModuleLoader';
import { filterSelectableDevices } from './audioDeviceSelection.mjs';

// NativeModule is loaded lazily on first call so early module require does not attempt to resolve electron before ready.
let _nativeModule: any = undefined;
function getNativeModule(): any {
    if (_nativeModule === undefined) {
        _nativeModule = loadNativeModule();
    }
    return _nativeModule;
}

export interface AudioDevice {
    id: string;
    name: string;
}

export class AudioDevices {
    public static getInputDevices(): AudioDevice[] {
        const mod = getNativeModule();
        const getInputDevices = mod?.getInputDevices;
        if (!getInputDevices) {
            console.warn('[AudioDevices] Native functionality not available');
            return [];
        }
        try {
            // Natively's own system-audio tap is an aggregate device that cpal
            // enumerates as an INPUT while a meeting is capturing (private
            // aggregates are hidden from other processes, not from ours). Left
            // unfiltered it appears in the mic dropdown, gets persisted as
            // preferredInputDeviceId, and then breaks every later meeting —
            // the tap does not exist yet when the mic channel starts. Filtering
            // at this single choke point also keeps the I/O-conflict fallback,
            // the built-in-mic lookup and the last-resort candidate ladder in
            // main.ts from ever selecting it.
            return filterSelectableDevices(getInputDevices());
        } catch (e) {
            console.error('[AudioDevices] Failed to get input devices:', e);
            return [];
        }
    }

    public static getOutputDevices(): AudioDevice[] {
        const mod = getNativeModule();
        const getOutputDevices = mod?.getOutputDevices;
        if (!getOutputDevices) {
            console.warn('[AudioDevices] Native functionality not available');
            return [];
        }
        try {
            // Same leak on the output side: the tap aggregate is built with
            // main_sub_device/sub_device_list pointing at the real output UID,
            // so it reports output buffers and is admitted by
            // list_output_devices(). Probed while a tap was running, it
            // enumerated AHEAD of the real speaker.
            return filterSelectableDevices(getOutputDevices());
        } catch (e) {
            console.error('[AudioDevices] Failed to get output devices:', e);
            return [];
        }
    }
}
