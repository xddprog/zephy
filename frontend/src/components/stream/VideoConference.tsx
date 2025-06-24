/* eslint-disable react-hooks/exhaustive-deps */
import { isEqualTrackRef, isTrackReference, isWeb, log } from '@livekit/components-core';

import {
	CarouselLayout,
	ConnectionStateToast,
	ControlBar,
	FocusLayout,
	FocusLayoutContainer,
	GridLayout,
	LayoutContextProvider,
	ParticipantTile,
	RoomAudioRenderer,
	useCreateLayoutContext,
	usePinnedTracks,
	useTracks,
	type MessageDecoder,
	type MessageEncoder,
	type MessageFormatter,
	type TrackReferenceOrPlaceholder,
	type WidgetState,
} from '@livekit/components-react';
import { RoomEvent, Track } from 'livekit-client';
import React from 'react';
import PersistentChat from './StreamChat';

/**
 * @public
 */
export interface VideoConferenceProps extends React.HTMLAttributes<HTMLDivElement> {
	chatMessageFormatter?: MessageFormatter;
	chatMessageEncoder?: MessageEncoder;
	chatMessageDecoder?: MessageDecoder;
	/** @alpha */
	SettingsComponent?: React.ComponentType;
	streamId: string;
}

/**
 * The `VideoConference` ready-made component is your drop-in solution for a classic video conferencing application.
 * It provides functionality such as focusing on one participant, grid view with pagination to handle large numbers
 * of participants, custom persistent chat, screen sharing, and more.
 *
 * @remarks
 * The component is implemented with other LiveKit components like `FocusContextProvider`,
 * `GridLayout`, `ControlBar`, `FocusLayoutContainer` and `FocusLayout`.
 * You can use these components as a starting point for your own custom video conferencing application.
 *
 * @example
 * ```tsx
 * <LiveKitRoom>
 *   <VideoConference roomName="test-room" />
 * </LiveKitRoom>
 * ```
 * @public
 */
export function VideoConference({
	SettingsComponent,
	streamId,
	// chatMessageFormatter,
	// chatMessageEncoder,
	// chatMessageDecoder,
	...props
}: VideoConferenceProps) {
	const [widgetState, setWidgetState] = React.useState<WidgetState>({
		showChat: false,
		unreadMessages: 0,
		showSettings: false,
	});
	const lastAutoFocusedScreenShareTrack = React.useRef<TrackReferenceOrPlaceholder | null>(null);

	const tracks = useTracks(
		[
			{ source: Track.Source.Camera, withPlaceholder: true },
			{ source: Track.Source.ScreenShare, withPlaceholder: false },
		],
		{ updateOnlyOn: [RoomEvent.ActiveSpeakersChanged], onlySubscribed: false },
	);

	const widgetUpdate = (state: WidgetState) => {
		log.debug('updating widget state', state);
		setWidgetState(state);
	};

	const layoutContext = useCreateLayoutContext();

	const screenShareTracks = tracks
		.filter(isTrackReference)
		.filter((track) => track.publication.source === Track.Source.ScreenShare);

	const focusTrack = usePinnedTracks(layoutContext)?.[0];
	const carouselTracks = tracks.filter((track) => !isEqualTrackRef(track, focusTrack));

	React.useEffect(() => {
		// Автофокус на шаринг экрана
		if (
			screenShareTracks.some((track) => track.publication.isSubscribed) &&
			lastAutoFocusedScreenShareTrack.current === null
		) {
			log.debug('Auto set screen share focus:', { newScreenShareTrack: screenShareTracks[0] });
			layoutContext.pin.dispatch?.({ msg: 'set_pin', trackReference: screenShareTracks[0] });
			lastAutoFocusedScreenShareTrack.current = screenShareTracks[0];
		} else if (
			lastAutoFocusedScreenShareTrack.current &&
			!screenShareTracks.some(
				(track) =>
					track.publication.trackSid ===
					lastAutoFocusedScreenShareTrack.current?.publication?.trackSid,
			)
		) {
			log.debug('Auto clearing screen share focus.');
			layoutContext.pin.dispatch?.({ msg: 'clear_pin' });
			lastAutoFocusedScreenShareTrack.current = null;
		}
		if (focusTrack && !isTrackReference(focusTrack)) {
			const updatedFocusTrack = tracks.find(
				(tr) =>
					tr.participant.identity === focusTrack.participant.identity &&
					tr.source === focusTrack.source,
			);
			if (updatedFocusTrack !== focusTrack && isTrackReference(updatedFocusTrack)) {
				layoutContext.pin.dispatch?.({ msg: 'set_pin', trackReference: updatedFocusTrack });
			}
		}
	}, [
		screenShareTracks
			.map((ref) => `${ref.publication.trackSid}_${ref.publication.isSubscribed}`)
			.join(),
		focusTrack?.publication?.trackSid,
		tracks,
	]);

	useWarnAboutMissingStyles();

	return (
		<div className="lk-video-conference" {...props}>
			{isWeb() && (
				<LayoutContextProvider value={layoutContext} onWidgetChange={widgetUpdate}>
					<div className="lk-video-conference-inner">
						{!focusTrack ? (
							<div className="lk-grid-layout-wrapper">
								<GridLayout tracks={tracks}>
									<ParticipantTile />
								</GridLayout>
							</div>
						) : (
							<div className="lk-focus-layout-wrapper">
								<FocusLayoutContainer>
									<CarouselLayout tracks={carouselTracks}>
										<ParticipantTile />
									</CarouselLayout>
									{focusTrack && <FocusLayout trackRef={focusTrack} />}
								</FocusLayoutContainer>
							</div>
						)}
						<ControlBar controls={{ chat: false, settings: !!SettingsComponent }} /> {/* Отключаем встроенный чат */}
					</div>
					<PersistentChat streamId={streamId} />
					{SettingsComponent && (
						<div
							className="lk-settings-menu-modal"
							style={{ display: widgetState.showSettings ? 'block' : 'none' }}
						>
							<SettingsComponent />
						</div>
					)}
				</LayoutContextProvider>
			)}
			<RoomAudioRenderer />
			<ConnectionStateToast />
		</div>
	);
}

function useWarnAboutMissingStyles() {
	React.useEffect(() => {
		if (!document.querySelector('style[data-lk-theme]')) {
			console.warn(
				'LiveKit styles are missing. Make sure to import `@livekit/components-styles` in your project.',
			);
		}
	}, []);
}