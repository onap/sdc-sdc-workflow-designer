import React from 'react';
import PropTypes from 'prop-types';
import { I18n } from 'react-redux-i18n';
import InputBootstrap from 'common/shared-components/input/validation/Input';

const Description = ({ description, onDataChange, dataTestId }) => (
    <div className="description-part">
        <InputBootstrap
            type="textarea"
            value={description || ''}
            label={I18n.t('workflow.general.description')}
            overlayPos="bottom"
            className="field-section"
            data-test-id={dataTestId || 'description'}
            onChange={val => onDataChange({ description: val })}
        />
    </div>
);

Description.propTypes = {
    description: PropTypes.string,
    onDataChange: PropTypes.func,
    dataTestId: PropTypes.string
};

export default Description;
