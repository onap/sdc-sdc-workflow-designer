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

import { connect } from 'react-redux';
import {
    showAlertModalAction,
    hideModalAction
} from 'shared/modal/modalWrapperActions';

import {
    getIsShowInputs,
    getSearch,
    getDataRows,
    getTypes,
    getError
} from './inputOutputSelectors';
import {
    changeError,
    showInputs,
    showOutputs,
    search,
    add,
    changeName,
    changeType,
    changeMandatory,
    remove
} from './inputOutputReducer';

import InputOutputView from './InputOutputView';

const mapStateToProps = state => ({
    isShowInputs: getIsShowInputs(state),
    search: getSearch(state),
    dataRows: getDataRows(state),
    types: getTypes(state),
    error: getError(state)
});

const mapDispatchToProps = dispatch => ({
    handleChangeError: payload => dispatch(changeError(payload)),
    handleShowInputs: () => dispatch(showInputs()),
    handleShowOutputs: () => dispatch(showOutputs()),
    handleSearch: value => dispatch(search(value)),
    handleAdd: () => dispatch(add()),
    handleNameChange: (name, key) => dispatch(changeName(name, key)),
    handleTypeChange: (type, key) => dispatch(changeType(type, key)),
    handleMandatoryChange: (mandatory, key) =>
        dispatch(changeMandatory(mandatory, key)),
    handleRemove: (alertProps, key) => {
        if (alertProps) {
            return dispatch(
                showAlertModalAction({
                    ...alertProps,
                    withButtons: true,
                    actionButtonClick: () =>
                        dispatch(hideModalAction()) && dispatch(remove(key))
                })
            );
        }

        return dispatch(remove(key));
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(InputOutputView);
