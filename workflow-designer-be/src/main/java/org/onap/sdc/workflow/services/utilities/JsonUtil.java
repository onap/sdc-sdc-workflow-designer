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

package org.onap.sdc.workflow.services.utilities;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonIOException;
import com.google.gson.JsonSyntaxException;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Reader;
import java.io.StringReader;

public class JsonUtil {

    private static final Gson gson = new Gson();

    private JsonUtil() {
    }

    /**
     * Object 2 json string.
     *
     * @param obj the obj
     * @return the string
     */
    public static String object2Json(Object obj) {
        return sbObject2Json(obj).toString();

    }

    /**
     * Sb object 2 json string builder.
     *
     * @param obj the obj
     * @return the string builder
     */
    public static StringBuilder sbObject2Json(Object obj) {
        return new StringBuilder(new GsonBuilder().setPrettyPrinting().create().toJson(obj));
    }

    /**
     * Json 2 object t.
     *
     * @param <T>      the type parameter
     * @param json     the json
     * @param classOfT the class of t
     * @return the t
     */
    public static <T> T json2Object(String json, Class<T> classOfT) {
        T typ;
        try {
            try (Reader br = new StringReader(json)) {
                typ = gson.fromJson(br, classOfT);
            }
        } catch (JsonIOException | JsonSyntaxException | IOException exception) {
            throw new RuntimeException(exception);
        }
        return typ;
    }

    /**
     * Json 2 object t.
     *
     * @param <T>      the type parameter
     * @param is       the is
     * @param classOfT the class of t
     * @return the t
     */
    public static <T> T json2Object(InputStream is, Class<T> classOfT) {
        T type;
        try (Reader br = new BufferedReader(new InputStreamReader(is))) {
            type = new Gson().fromJson(br, classOfT);
        } catch (JsonIOException | JsonSyntaxException | IOException exception) {
            throw new RuntimeException(exception);
        }
        return type;
    }

}
