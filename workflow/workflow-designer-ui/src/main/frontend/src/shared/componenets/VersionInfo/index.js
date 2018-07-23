import React from 'react';
import PropTypes from 'prop-types';
import { I18n } from 'react-redux-i18n';
import { Localize } from 'react-redux-i18n';
export const LabeledValue = ({ title, value }) => (
    <React.Fragment>
        <div className="label">{title}</div>
        <div className="value">{value}</div>
    </React.Fragment>
);

LabeledValue.propTypes = {
    title: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.object])
};

export const VersionInfo = ({ created, modified, children }) => (
    <div className="version-info-part">
        <LabeledValue
            title={I18n.t('workflow.general.created')}
            value={<Localize value={created} dateFormat="date.short" />}
        />
        <LabeledValue
            title={I18n.t('workflow.general.modified')}
            value={<Localize value={modified} dateFormat="date.short" />}
        />
        {children}
    </div>
);

VersionInfo.defaultProps = {
    created: '',
    modified: ''
};

VersionInfo.propTypes = {
    created: PropTypes.string,
    modified: PropTypes.string,
    children: PropTypes.oneOfType([PropTypes.array, PropTypes.object])
};
