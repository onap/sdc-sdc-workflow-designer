package org.onap.sdc.workflow.api.swagger;

import static org.junit.Assert.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.classmate.TypeResolver;
import com.google.common.base.Optional;
import java.lang.annotation.Annotation;
import java.util.ArrayList;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.onap.sdc.workflow.services.annotations.UserId;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import springfox.documentation.builders.ParameterBuilder;
import springfox.documentation.service.ResolvedMethodParameter;
import springfox.documentation.spi.service.contexts.ParameterContext;

@RunWith(SpringJUnit4ClassRunner.class)
public class UserIdReaderTest {

    public static final UserId USER_ID_ANNOTATION = new UserId() {

        @Override
        public Class<? extends Annotation> annotationType() {
            return UserId.class;
        }
    };
    @Mock
    TypeResolver resolver;
    @Mock
    ResolvedMethodParameter resolvedMethodParameter;
    @Mock
    ParameterBuilder parameterBuilder;
    @Mock
    ParameterContext parameterContext;
    @InjectMocks
    UserIdReader userIdReader;

    @Test
    public void shouldNotCallToParameterBuilderIfUserIdAnnotationNotFound(){
        when(parameterContext.resolvedMethodParameter()).thenReturn(resolvedMethodParameter);
        when(resolvedMethodParameter.findAnnotation(UserId.class)).thenReturn(Optional.absent());
        userIdReader.apply(parameterContext);
        verify(parameterContext, times(0)).parameterBuilder();
    }

    @Test
    public void shouldCallToParameterBuilderIfUserIdAnnotationFound(){

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