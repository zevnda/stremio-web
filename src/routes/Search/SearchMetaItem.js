// Copyright (C) 2017-2023 Smart code 203358507

const React = require('react');
const PropTypes = require('prop-types');
const { useCore } = require('stremio/core');
const MetaItem = require('stremio/components/MetaItem');

const SearchMetaItem = ({ _id, inLibrary, className, ...itemProps }) => {
    const core = useCore();

    const itemDataRef = React.useRef(null);
    itemDataRef.current = { _id, ...itemProps };

    const onLibraryClick = React.useCallback(() => {
        if (inLibrary) {
            core.transport.dispatch({
                action: 'Ctx',
                args: {
                    action: 'RemoveFromLibrary',
                    args: _id
                }
            });
        } else {
            core.transport.dispatch({
                action: 'Ctx',
                args: {
                    action: 'AddToLibrary',
                    args: itemDataRef.current
                }
            });
        }
    }, [_id, inLibrary]);

    return (
        <MetaItem
            {...itemProps}
            className={className}
            inLibrary={inLibrary}
            onLibraryClick={onLibraryClick}
        />
    );
};

SearchMetaItem.displayName = 'SearchMetaItem';

SearchMetaItem.propTypes = {
    _id: PropTypes.string,
    inLibrary: PropTypes.bool,
    className: PropTypes.string,
};

module.exports = SearchMetaItem;
