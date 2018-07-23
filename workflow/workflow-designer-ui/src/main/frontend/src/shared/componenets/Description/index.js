import React from 'react';
import PropTypes from 'prop-types';
import { I18n } from 'react-redux-i18n';

const Description = ({ description, onDataChange, dataTestId }) => (
    <div className="description-part">
        <div className="sdc-input">
            <div className="sdc-input__label">
                {I18n.t('workflow.general.description')}
            </div>
            <textarea
                value={description}
                data-test-id={dataTestId || 'description'}
                onChange={event => {
                    onDataChange({ description: event.target.value });
                }}
                className="field-section sdc-input__input"
            />
        </div>
    </div>
);

Description.propTypes = {
    description: PropTypes.string,
    onDataChange: PropTypes.func,
    dataTestId: PropTypes.string
};

export default Description;
