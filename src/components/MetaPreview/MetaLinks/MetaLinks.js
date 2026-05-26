// Copyright (C) 2017-2023 Smart code 203358507

const React = require('react');
const PropTypes = require('prop-types');
const classnames = require('classnames');
const { Button } = require('stremio/components');
const useTranslate = require('stremio/common/useTranslate');
const styles = require('./styles');

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w185';
const imageCache = new Map();

function fetchPersonImage(name) {
    const apiKey = localStorage.getItem('tmdbApiKey');
    if (!apiKey) return Promise.resolve(null);
    if (imageCache.has(name)) return Promise.resolve(imageCache.get(name));
    imageCache.set(name, null);
    return fetch(
        `https://api.themoviedb.org/3/search/person?api_key=${apiKey}&query=${encodeURIComponent(name)}&language=en-US&page=1`
    )
        .then((res) => res.json())
        .then((data) => {
            const profilePath = data.results && data.results[0] && data.results[0].profile_path;
            const url = profilePath ? `${TMDB_IMAGE_BASE}${profilePath}` : null;
            imageCache.set(name, url);
            return url;
        })
        .catch(() => null);
}

function getInitials(name) {
    return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

const PersonAvatar = ({ name, imageUrl }) => {
    const [imgFailed, setImgFailed] = React.useState(false);
    const [imgLoaded, setImgLoaded] = React.useState(false);

    React.useEffect(() => {
        setImgFailed(false);
        setImgLoaded(false);
    }, [imageUrl]);

    const showImage = typeof imageUrl === 'string' && !imgFailed && imgLoaded;

    return (
        <div className={styles['person-avatar']}>
            {typeof imageUrl === 'string' && !imgFailed && (
                <img
                    className={styles['person-image']}
                    src={imageUrl}
                    alt={name}
                    style={{ display: imgLoaded ? 'block' : 'none' }}
                    onLoad={() => setImgLoaded(true)}
                    onError={() => setImgFailed(true)}
                />
            )}
            {!showImage && (
                <div className={styles['person-initials']}>
                    {getInitials(name)}
                </div>
            )}
        </div>
    );
};

PersonAvatar.propTypes = {
    name: PropTypes.string,
    imageUrl: PropTypes.string,
};

const MetaLinks = ({ className, label, links, showImages }) => {
    const { string, stringWithPrefix } = useTranslate();
    const [images, setImages] = React.useState({});

    React.useEffect(() => {
        if (!showImages || !Array.isArray(links)) return;
        links.forEach(({ label: name }) => {
            if (!name) return;
            fetchPersonImage(name).then((url) => {
                setImages((prev) => ({ ...prev, [name]: url }));
            });
        });
    }, [showImages, links]);

    return (
        <div className={classnames(className, styles['meta-links-container'])}>
            {
                typeof label === 'string' && label.length > 0 ?
                    <div className={styles['label-container']}>
                        { stringWithPrefix(label.toUpperCase(), 'LINKS_') }
                    </div>
                    :
                    null
            }
            {
                Array.isArray(links) && links.length > 0 ?
                    showImages ? (
                        <div className={styles['persons-container']}>
                            {links.map(({ label: name, href }, index) => (
                                <Button key={index} className={styles['person-card']} title={name} href={href}>
                                    <PersonAvatar name={name} imageUrl={images[name]} />
                                    <div className={styles['person-name']}>{string(name)}</div>
                                </Button>
                            ))}
                        </div>
                    ) : (
                        <div className={styles['links-container']}>
                            {links.map(({ label, href }, index) => (
                                <Button key={index} className={styles['link-container']} title={label} href={href}>
                                    { string(label) }
                                </Button>
                            ))}
                        </div>
                    )
                    :
                    null
            }
        </div>
    );
};

MetaLinks.propTypes = {
    className: PropTypes.string,
    label: PropTypes.string,
    links: PropTypes.arrayOf(PropTypes.shape({
        label: PropTypes.string,
        href: PropTypes.string
    })),
    showImages: PropTypes.bool,
};

module.exports = MetaLinks;
