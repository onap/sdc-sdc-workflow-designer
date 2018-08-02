/*
* Copyright © 2018 European Support Limited
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
import { connect } from 'react-redux';
import { I18n } from 'react-redux-i18n';
import { updateComposition } from './compositionActions';
import CompositionView from './CompositionView';
import { showErrorModalAction } from '../../../shared/modal/modalWrapperActions';
import { getComposition } from './compositionSelectors';
import { getWorkflowName } from '../../workflow/workflowSelectors';

function mapStateToProps(state) {
    return {
        composition: getComposition(state),
        name: getWorkflowName(state)
    };
}

function mapDispatchToProps(dispatch) {
    return {
        compositionUpdate: composition =>
            dispatch(updateComposition(composition)),
        showErrorModal: msg =>
            dispatch(
                showErrorModalAction({
                    title: I18n.t('workflow.composition.bpmnError'),
                    body: msg,
                    withButtons: true,
                    closeButtonText: 'Ok'
                })
            )
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(CompositionView);
