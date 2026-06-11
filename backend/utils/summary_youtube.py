from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled, NoTranscriptFound
from youtube_transcript_api.formatters import TextFormatter
from urllib.parse import urlparse, parse_qs


def get_video_id(url):
    '''Extract the video ID from a YouTube URL.'''
    parsed_url = urlparse(url)
    if parsed_url.hostname in ['www.youtube.com', 'youtube.com']:
        query = parse_qs(parsed_url.query)
        return query.get('v', [None])[0]
    elif parsed_url.hostname == 'youtu.be':
        return parsed_url.path[1:]
    return None


def get_transcript_text(youtube_url: str) -> str:
    '''
    Extracts subtitle text from a YouTube video, using the original language.
    Returns a string with all text.
    '''
    video_id = get_video_id(youtube_url)
    if not video_id:
        raise ValueError('Invalid YouTube URL')

    try:
        # Get the object with available transcripts
        transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)

        # Try to find the original transcript (manually created, preferably)
        try:
            transcript = transcript_list.find_manually_created_transcript(['en', 'ru', 'de', 'es', 'fr', 'pt'])
        except NoTranscriptFound:
            # If no manual transcript exists, try any auto-generated one
            transcript = transcript_list.find_generated_transcript(['en', 'ru', 'de', 'es', 'fr', 'pt'])

        # Format as plain text
        formatter = TextFormatter()
        return ' '.join(formatter.format_transcript(transcript.fetch()).replace('\n', ' ').split())


    except TranscriptsDisabled:
        raise RuntimeError('Subtitles are disabled for this video.')
    except NoTranscriptFound:
        raise RuntimeError('No available subtitles for this video.')


