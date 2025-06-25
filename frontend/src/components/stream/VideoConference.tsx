/* eslint-disable react-hooks/exhaustive-deps */
import { isTrackReference, isWeb, log } from '@livekit/components-core';
import {
	ConnectionStateToast,
	ControlBar,
	GridLayout,
	LayoutContextProvider,
	ParticipantTile,
	RoomAudioRenderer,
	useCreateLayoutContext,
	useLocalParticipant,
	usePinnedTracks,
	useRoomContext,
	useTracks,
	type MessageDecoder,
	type MessageEncoder,
	type MessageFormatter,
	type TrackReferenceOrPlaceholder,
	type WidgetState
} from '@livekit/components-react';
import { RoomEvent, Track } from 'livekit-client';
import React from 'react';
import type { StreamInfo } from '../../schemas/room';
import StreamChat from './StreamChat';

/**
 * @public
 */
export interface VideoConferenceProps extends React.HTMLAttributes<HTMLDivElement> {
	chatMessageFormatter?: MessageFormatter;
	chatMessageEncoder?: MessageEncoder;
	chatMessageDecoder?: MessageDecoder;
	/** @alpha */
	SettingsComponent?: React.ComponentType;
	streamInfo: StreamInfo;
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
 *   <VideoConference roomName="test-room" streamerIdentity="streamer" />
 * </LiveKitRoom>
 * ```
 * @public
 */
export function VideoConference({
	SettingsComponent,
	streamInfo,
	// chatMessageFormatter,
	// chatMessageEncoder,
	// chatMessageDecoder,
	...props
}: VideoConferenceProps) {
	const [widgetState, setWidgetState] = React.useState<WidgetState>({
		showChat: true, // Чат виден по умолчанию
		unreadMessages: 0,
		showSettings: false,
	});
	const lastAutoFocusedScreenShareTrack = React.useRef<TrackReferenceOrPlaceholder | null>(null);
	
	const room = useRoomContext();
	const localParticipant = useLocalParticipant();

	// Фильтруем треки, чтобы показывать только треки стримера
	const tracks = useTracks(
		[
			{ source: Track.Source.Camera, withPlaceholder: true },
			{ source: Track.Source.ScreenShare, withPlaceholder: false },
		],
		{ updateOnlyOn: [RoomEvent.ActiveSpeakersChanged], onlySubscribed: false },
	).filter((track) => track.participant.identity === streamInfo.streamerInfo.id);

	// Управление публикацией треков
	React.useEffect(() => {
		console.log(localParticipant.localParticipant, streamInfo)
		if (localParticipant.localParticipant.identity !== streamInfo.streamerInfo.id) {
			// Отключаем публикацию для зрителей
			localParticipant.localParticipant.setCameraEnabled(false).catch((err) =>
				log.error('Не удалось отключить камеру:', err),
			);
			localParticipant.localParticipant.setMicrophoneEnabled(false).catch((err) =>
				log.error('Не удалось отключить микрофон:', err),
			);
			localParticipant.localParticipant.setScreenShareEnabled(false).catch((err) =>
				log.error('Не удалось отключить шаринг экрана:', err),
			);
		}
		// Для стримера публикация управляется через LiveKitRoom (video/audio)
	}, [localParticipant, streamInfo.streamerInfo.id]);

	const widgetUpdate = (state: WidgetState) => {
		log.debug('updating widget state', state);
		setWidgetState(state);
	};

	const layoutContext = useCreateLayoutContext();

	const screenShareTracks = tracks
		.filter(isTrackReference)
		.filter((track) => track.publication.source === Track.Source.ScreenShare);

	const focusTrack = usePinnedTracks(layoutContext)?.[0] || tracks.find(isTrackReference); // Фокус на треке стримера
	const carouselTracks: TrackReferenceOrPlaceholder[] = []; // Отключаем карусель

	React.useEffect(() => {
		// Автофокус на шаринг экрана стримера
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
	}, [
		screenShareTracks
			.map((ref) => `${ref.publication.trackSid}_${ref.publication.isSubscribed}`)
			.join(),
		focusTrack?.publication?.trackSid,
		tracks,
	]);

	useWarnAboutMissingStyles();

	return focusTrack && (
		<div className="lk-video-conference w-full" {...props}>
			{isWeb() && (
				<LayoutContextProvider value={layoutContext} onWidgetChange={widgetUpdate}>
					<div className="lk-video-conference-inner w-full">
						{tracks.length > 0 ? (
							<div className="lk-grid-layout-wrapper">
								<GridLayout tracks={[focusTrack]}>
									<ParticipantTile />
								</GridLayout>
							</div>
						) : (<></>)}
						<ControlBar controls={{ chat: true, settings: !!SettingsComponent }} />
					</div>
					<StreamChat streamId={streamInfo.id} />
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

// src/components/FocusLayout.jsx

// src/components/FocusLayout.jsx
