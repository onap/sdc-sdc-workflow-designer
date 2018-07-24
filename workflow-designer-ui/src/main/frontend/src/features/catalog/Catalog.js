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

import CatalogView from 'features/catalog/CatalogView';
import { sort, scroll } from 'features/catalog/catalogActions';
import { getSort, getWorkflows } from 'features/catalog/catalogSelectors';

import { showCustomModalAction } from 'shared/modal/modalWrapperActions';
import { NEW_WORKFLOW_MODAL } from 'shared/modal/modalWrapperComponents';
import { clearWorkflowAction } from 'features/workflow/workflowConstants';

const mapStateToProps = state => ({
    sort: getSort(state),
    workflows: getWorkflows(state)
});

const mapDispatchToProps = dispatch => ({
    handleSort: payload => dispatch(sort(payload)),
    handleScroll: (page, sort) => dispatch(scroll(page, sort)),
    clearWorkflow: () => dispatch(clearWorkflowAction),
    showNewWorkflowModal: () =>
        dispatch(
            showCustomModalAction({
                customComponentName: NEW_WORKFLOW_MODAL,
                title: 'New Workflow'
            })
        )
});

const Catalog = connect(mapStateToProps, mapDispatchToProps)(CatalogView);

export default Catalog;
