/*
* Copyright © 2018 European Support Limited
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http: //www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

import React from 'react';
import PropTypes from 'prop-types';
import { Translate, I18n } from 'react-redux-i18n';
import cn from 'classnames';
import { SVGIcon } from 'sdc-ui/lib/react';

import Scrollbars from 'shared/scroll/Scrollbars';
import SearchInput from 'shared/searchInput/SearchInput';
import { getValidationsError } from 'features/version/inputOutput/inputOutputValidations';
import Tab from 'features/version/inputOutput/views/Tab';
import TableHead from 'features/version/inputOutput/views/TableHead';
import TableBody from 'features/version/inputOutput/views/TableBody';
import NoDataRow from 'features/version/inputOutput/views/NoDataRow';
import DataRow from 'features/version/inputOutput/views/DataRow';

class InputOutputView extends React.Component {
    componentDidUpdate() {
        const { dataRows, error, handleChangeError } = this.props;

        const validationsError = getValidationsError(dataRows);

        const isDiff = Object.keys(validationsError).some(errorKey => {
            if (!error.hasOwnProperty(errorKey)) {
                return true;
            }

            return (
                JSON.stringify(validationsError[errorKey].sort()) !==
                JSON.stringify(error[errorKey].sort())
            );
        });

        if (isDiff) {
            handleChangeError(validationsError);
        }
    }

    handleInputsTabClick = () => {
        if (!this.props.isShowInputs) {
            this.props.handleShowInputs();
        }
    };

    handleOutputsTabClick = () => {
        if (this.props.isShowInputs) {
            this.props.handleShowOutputs();
        }
    };

    handleSearchChange = value => {
        this.props.handleSearch(value);
    };

    handleNameChange = (key, isBlur = false) => value => {
        let name = isBlur ? value.target.value : value;
        name = name.replace(/\s+/g, ' ');
        name = isBlur
            ? name.replace(/^\s+|\s+$/g, '')
            : name.replace(/^\s+/g, '');

        this.props.handleNameChange(name, key);
    };

    handleTypeChange = key => event => {
        this.props.handleTypeChange(event.target.value, key);
    };

    handleMandatoryChange = key => value => {
        this.props.handleMandatoryChange(value, key);
    };

    handleRemoveClick = key => () => {
        const { name } = this.props.dataRows[key];

        let alertProps = false;

        if (name.replace(/\s+/g, '')) {
            const title = I18n.t('workflow.inputOutput.DELETE');
            const body = I18n.t('workflow.inputOutput.confirmDelete', {
                name: name.replace(/s+$/g, '')
            });
            const closeButtonText = I18n.t('workflow.inputOutput.CANCEL');
            const actionButtonText = title;

            alertProps = {
                title,
                body,
                closeButtonText,
                actionButtonText
            };
        }

        this.props.handleRemove(alertProps, key);
    };

    renderDataRows = () => {
        const { dataRows, types, error } = this.props;

        if (dataRows.length < 1) {
            return (
                <NoDataRow>
                    <Translate value="workflow.inputOutput.noData" />
                </NoDataRow>
            );
        }

        return dataRows.map((data, i) => {
            let errorMessage = '';

            if (
                error.invalidCharacters &&
                error.invalidCharacters.includes(i)
            ) {
                errorMessage = I18n.t(
                    'workflow.errorMessages.invalidCharacters'
                );
            } else if (error.alreadyExists && error.alreadyExists.includes(i)) {
                errorMessage = I18n.t('workflow.errorMessages.alreadyExists');
            } else if (error.emptyName && error.emptyName.includes(i)) {
                errorMessage = I18n.t('workflow.errorMessages.emptyName');
            }

            return (
                <DataRow
                    key={`data.${i}`}
                    data={data}
                    types={types}
                    nameErrorMessage={errorMessage}
                    dataTestId="wf-input-output-row"
                    handleNameChange={this.handleNameChange(i)}
                    handleNameBlur={this.handleNameChange(i, true)}
                    handleTypeChange={this.handleTypeChange(i)}
                    handleMandatoryChange={this.handleMandatoryChange(i)}
                    handleRemoveClick={this.handleRemoveClick(i)}
                />
            );
        });
    };

    render() {
        const { isShowInputs, search, handleAdd, isCertified } = this.props;

        const addLabel = isShowInputs
            ? I18n.t('workflow.inputOutput.addInput')
            : I18n.t('workflow.inputOutput.addOutput');

        const dataRowsView = this.renderDataRows();

        return (
            <div className="input-output">
                <div className="input-output__header">
                    <Tab
                        isActive={isShowInputs}
                        dataTestId="wf-input-output-inputs"
                        handleTabClick={this.handleInputsTabClick}>
                        <Translate value="workflow.inputOutput.inputs" />
                    </Tab>
                    <Tab
                        isActive={!isShowInputs}
                        dataTestId="wf-input-output-outputs"
                        handleTabClick={this.handleOutputsTabClick}>
                        <Translate value="workflow.inputOutput.outputs" />
                    </Tab>
                    <div className="input-output__header__right">
                        <div className="input-output__search">
                            <SearchInput
                                dataTestId="wf-input-output-search"
                                onChange={this.handleSearchChange}
                                value={search}
                            />
                        </div>
                        <div
                            className={cn('input-output__add', {
                                disabled: isCertified
                            })}
                            data-test-id="wf-input-output-add"
                            onClick={handleAdd}>
                            <SVGIcon
                                label={addLabel}
                                labelPosition="right"
                                color="primary"
                                name="plusThin"
                            />
                        </div>
                    </div>
                </div>
                <div className="input-output__table">
                    <TableHead />
                    <TableBody isCertified={isCertified}>
                        <Scrollbars className="scrollbars">
                            {dataRowsView}
                        </Scrollbars>
                    </TableBody>
                </div>
            </div>
        );
    }
}

InputOutputView.propTypes = {
    isShowInputs: PropTypes.bool,
    search: PropTypes.string,
    dataRows: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string,
            type: PropTypes.string,
            mandatory: PropTypes.bool
        })
    ),
    types: PropTypes.array,
    error: PropTypes.object,
    isCertified: PropTypes.bool,
    handleChangeError: PropTypes.func,
    handleShowInputs: PropTypes.func,
    handleShowOutputs: PropTypes.func,
    handleSearch: PropTypes.func,
    handleAdd: PropTypes.func,
    handleCurrentDataChange: PropTypes.func,
    handleNameChange: PropTypes.func,
    handleTypeChange: PropTypes.func,
    handleMandatoryChange: PropTypes.func,
    handleRemove: PropTypes.func
};

export default InputOutputView;
