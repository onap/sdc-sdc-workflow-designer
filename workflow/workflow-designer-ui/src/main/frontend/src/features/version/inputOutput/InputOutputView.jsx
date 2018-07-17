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
import { SVGIcon } from 'sdc-ui/lib/react';

import ExpandableInput from 'common/shared-components/input/ExpandableInput';
import Tab from './views/Tab';
import TableHead from './views/TableHead';
import TableBody from './views/TableBody';
import NoDataRow from './views/NoDataRow';
import DataRow from './views/DataRow';

class InputOutputView extends React.Component {
    NAME_MAX_LEN = 50;

    componentDidUpdate() {
        const { dataRows, error, handleChangeError } = this.props;

        const payload = {};

        const groupBy = dataRows.reduce((result, value, key) => {
            const groupKey = value.name.toLowerCase();

            if (groupKey) {
                if (result.hasOwnProperty(groupKey)) {
                    result[groupKey].push(key);
                } else {
                    result[groupKey] = [key];
                }
            }
            return result;
        }, {});

        payload.alreadyExists = Object.keys(groupBy).reduce((result, value) => {
            if (groupBy[value].length > 1) {
                result = [...result, ...groupBy[value]];
            }

            return result;
        }, []);

        payload.invalidCharacters = dataRows.reduce((result, value, key) => {
            const groupKey = key === value.name;

            if (groupKey) {
                if (!/^[\w\s\d]+$/.test(groupKey)) {
                    result.push(key);
                }
            }

            return result;
        }, []);

        const isDiff = Object.keys(payload).some(errorKey => {
            if (!error.hasOwnProperty(errorKey)) {
                return true;
            }

            return (
                JSON.stringify(payload[errorKey].sort()) !==
                JSON.stringify(error[errorKey].sort())
            );
        });

        if (isDiff) {
            handleChangeError(payload);
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

        name = name.substr(0, this.NAME_MAX_LEN);

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
            const body = I18n.t('workflow.inputOutput.confirmDlete', {
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
                errorMessage = I18n.t('workflow.inputOutput.invalidCharacters');
            } else if (error.alreadyExists && error.alreadyExists.includes(i)) {
                errorMessage = I18n.t('workflow.inputOutput.alreadyExists');
            }

            return (
                <DataRow
                    key={`data.${i}`}
                    data={data}
                    types={types}
                    nameErrorMessage={errorMessage}
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
        const { isShowInputs, search, handleAdd } = this.props;

        const addLable = isShowInputs
            ? I18n.t('workflow.inputOutput.addInput')
            : I18n.t('workflow.inputOutput.addOutput');

        const dataRowsView = this.renderDataRows();

        return (
            <div className="input-output">
                <div className="input-output__title">
                    <Translate value="workflow.sideBar.inputOutput" />
                </div>
                <div className="input-output__header">
                    <Tab
                        isActive={isShowInputs}
                        handleTabClick={this.handleInputsTabClick}>
                        <Translate value="workflow.inputOutput.inputs" />
                    </Tab>
                    <Tab
                        isActive={!isShowInputs}
                        handleTabClick={this.handleOutputsTabClick}>
                        <Translate value="workflow.inputOutput.outputs" />
                    </Tab>
                    <div className="input-output__header__right">
                        <div className="input-output__search">
                            <ExpandableInput
                                onChange={this.handleSearchChange}
                                iconType="search"
                                value={search}
                            />
                        </div>
                        <div className="input-output__add" onClick={handleAdd}>
                            <SVGIcon
                                label={addLable}
                                labelPosition="right"
                                color="primary"
                                name="plusThin"
                            />
                        </div>
                    </div>
                </div>
                <div className="input-output__table">
                    <TableHead />
                    <TableBody>{dataRowsView}</TableBody>
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
