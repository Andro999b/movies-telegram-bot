import LocalizedStrings from 'react-localization';

export default new LocalizedStrings({
    en: {
        cantLoadPLaylist: 'Can`t load playlist',
        videoNotFound: 'Video not found',
        cantPlayMedia: 'Could not play media',
        urlCopied: 'URL copied!',
        shareWith: 'Share with...',
        curPlaylistPos: 'Current playlist position',
        curTimePos: 'Current time',
        shuffleOn: 'Shuffle playlist mode ON',
        shuffleOff: 'Shuffle playlist mode OFF',
        videoNotReleased: 'Video not released yet<br/><a href="{0}">Watch trailer</>'
    },
    ru: {
        cantLoadPLaylist: 'Ощибка загрузки',
        cantPlayMedia: 'Невозможно возпроизвести видео',
        videoNotFound: 'Видео не найдено',
        urlCopied: 'URL скопирован',
        shareWith: 'Поделится в...',
        curPlaylistPos: 'Серия',
        curTimePos: 'Время',
        shuffleOn: 'Случаный режим включен',
        shuffleOff: 'Случаный режим выключен',
        videoNotReleased: 'Видео еще не доступно<br/><a href="{0}">Смотреть трейлер</>'
    }
});