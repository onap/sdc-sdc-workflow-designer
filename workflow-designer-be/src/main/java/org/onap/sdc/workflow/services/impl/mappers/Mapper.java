package org.onap.sdc.workflow.services.impl.mappers;

import org.openecomp.sdc.common.errors.CoreException;
import org.openecomp.sdc.common.errors.ErrorCode;

/**
 * Base class for all mapping classes. Mapping classes will perform data mapping from source object
 * to target object Base class provides following<br>  <ol>  <li>provides life cycle of
 * mapping class , first mapSimpleProperties is called and then  mapComplexProperties is
 * called.</li>  <li>methods mapSimpleProperties and mapComplexProperties with default
 * implementation, these should  be overridden by concrete mapping classes for writing mapping
 * logic.</li>  </ol>
 */

public abstract class Mapper<S, T> {

    /**
     * Method is called for starting mapping from source object to target object method sets context
     * in the thread locale and than calls mapSimpleProperties and mapComplexProperties
     * respectively.
     *
     * @param source : source object for mapping
     * @param clazz  : target <code>Class</code> for mapping
     * @return <code>T</code> - instance of type <code>T</code>
     */

    public final T applyMapping(final S source, Class<T> clazz) {
        T target = (T) instantiateTarget(clazz);
        if (source != null && target != null) {
            preMapping(source, target);
            map(source, target);
            postMapping(source, target);

        }
        return target;

    }

    /**
     * This method is called before the <code>map</code> method.
     */
    protected void preMapping(final S source, T target) {
        // extension point
    }

    /**
     * The actual method that does the mapping between the <code>source</code> to <code>target</code>
     * objects.  This method is being called automatically as part of the mapper class.  This
     * method must be override (it is abstract) by the mapper class.
     *
     * @param source - the source object.
     * @param target - the target object.
     */

    public abstract void map(final S source, T target);

    /**
     * This method is called after the <code>map</code> method.
     */
    protected void postMapping(final S source, T target) {
        // extension point
    }

    /**
     * Creates the instance of the input class.
     *
     * @return <code>Object</code>
     */

    private Object instantiateTarget(final Class<?> clazz) {

        try {
            return clazz.newInstance();
        } catch (InstantiationException | IllegalAccessException exception) {
            throw new CoreException((new ErrorCode.ErrorCodeBuilder()).withMessage(exception.getMessage()).build(),
                    exception);
        }
    }
}

