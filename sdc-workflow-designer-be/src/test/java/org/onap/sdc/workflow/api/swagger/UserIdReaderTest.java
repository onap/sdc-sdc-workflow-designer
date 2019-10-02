/*
 * Copyright © 2018 European Support Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.onap.sdc.workflow.api.swagger;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.classmate.TypeResolver;
import com.google.common.base.Optional;
import java.lang.annotation.Annotation;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.onap.sdc.workflow.services.annotations.UserId;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import springfox.documentation.builders.ParameterBuilder;
import springfox.documentation.service.ResolvedMethodParameter;
import springfox.documentation.spi.service.contexts.ParameterContext;

@RunWith(SpringJUnit4ClassRunner.class)
public class UserIdReaderTest {

    private static final UserId USER_ID_ANNOTATION = new UserId() {

        @Override
        public Class<? extends Annotation> annotationType() {
            return UserId.class;
        }
    };

    @Mock
    TypeResolver resolver; // do not delete. this is used in the injection of UserIdReader constructor
    @Mock
    ResolvedMethodParameter resolvedMethodParameter;
    @Mock
    ParameterBuilder parameterBuilder;
    @Mock
    ParameterContext parameterContext;
    @InjectMocks
    UserIdReader userIdReader;

    @Test
    public void shouldNotCallToParameterBuilderIfUserIdAnnotationNotFound() {
        when(parameterContext.resolvedMethodParameter()).thenReturn(resolvedMethodParameter);
        when(resolvedMethodParameter.findAnnotation(UserId.class)).thenReturn(Optional.absent());
        userIdReader.apply(parameterContext);
        verify(parameterContext, times(0)).parameterBuilder();
    }

    @Test
    public void shouldCallToParameterBuilderIfUserIdAnnotationFound() {

        doReturn(resolvedMethodParameter).when(parameterContext).resolvedMethodParameter();
        doReturn(parameterBuilder).when(parameterContext).parameterBuilder();
        doReturn(parameterBuilder).when(parameterBuilder).parameterType(any());
        doReturn(parameterBuilder).when(parameterBuilder).name(any());
        doReturn(parameterBuilder).when(parameterBuilder).type(any());
        doReturn(Optional.of(USER_ID_ANNOTATION)).when(resolvedMethodParameter).findAnnotation(UserId.class);

        userIdReader.apply(parameterContext);
        verify(parameterContext, times(1)).parameterBuilder();
    }
}