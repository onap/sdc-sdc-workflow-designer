import React from 'react';
import PropTypes from 'prop-types';
import SVGIcon from 'sdc-ui/lib/react/SVGIcon';

export const CompositionButton = ({ onClick, name, title }) => (
    <div onClick={onClick} className={`diagram-btn`}>
        <SVGIcon title={title} name={name} />
    </div>
);

CompositionButton.propTypes = {
    onClick: PropTypes.func,
    className: PropTypes.string,
    name: PropTypes.string,
    title: PropTypes.string
};

const Divider = () => <div className="divider" />;

const CompositionButtons = ({ onClean, onUpload, onDownload }) => (
    <div className="composition-buttons">
        <CompositionButton
            data-test-id="composition-clear-btn"
            onClick={onClean}
            name="trashO"
            title="clear"
        />
        <Divider />
        <CompositionButton
            data-test-id="composition-download-btn"
            onClick={onDownload}
            name="download"
            title="download"
        />
        <Divider />
        <CompositionButton
            data-test-id="composition-download-upload"
            onClick={onUpload}
            name="upload"
            title="upload"
        />
    </div>
);

CompositionButtons.propTypes = {
    onClean: PropTypes.func,
    onUpload: PropTypes.func,
    onDownload: PropTypes.func
};
export default CompositionButtons;
