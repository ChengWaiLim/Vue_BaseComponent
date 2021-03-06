import moment from "moment";
import { sha256 } from "js-sha256";
const Plugin = {
    install(Vue, options) {
        Vue.mixin({
            methods: {
                isJSONObject(obj) {
                    return obj !== undefined && obj !== null && obj.constructor == Object
                },
                isPropExisted(object, prop) {
                    if (!object.hasOwnProperty(prop))
                        return false
                    if (object[prop] == null || object[prop] === "")
                        return false
                    return true
                },
                getDeepObjectProp(object, properties) {
                    var propertiesArray = properties.split(".")
                    propertiesArray.forEach(f => {
                        object = object[f]
                    })
                    return object
                },
                generateRandomString(length) {
                    var result = [];
                    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                    var charactersLength = characters.length;
                    for (var i = 0; i < length; i++) {
                        result.push(characters.charAt(Math.floor(Math.random() * charactersLength)));
                    }
                    return result.join('');
                },
                checkPermission(userRight) {
                    return (
                        userRight.find(
                            (f) => this.$store.getters.userType.indexOf(f) != -1
                        ) != null
                    );
                },
                checkReadPermission(page) {
                    try {
                        if (page == null)
                            return this.checkPermission(
                                findPageByUserAuth(this.$store.getters.userAuth, this.$route.path).readAuth
                            );
                        else
                            return this.checkPermission(
                                findPageByUserAuth(this.$store.getters.userAuth, page).readAuth
                            );
                    } catch (exception) {
                        console.log(exception);
                        return false
                    }
                },
                checkCreatePermission(page) {
                    try {
                        if (page == null)
                            return this.checkPermission(
                                findPageByUserAuth(this.$store.getters.userAuth, this.$route.path).createAuth
                            );
                        else
                            return this.checkPermission(
                                findPageByUserAuth(this.$store.getters.userAuth, page).createAuth
                            );
                    } catch (exception) {
                        console.log(exception);
                        return false
                    }
                },
                checkUpdatePermission(page) {
                    try {
                        if (page == null)
                            return this.checkPermission(
                                findPageByUserAuth(this.$store.getters.userAuth, this.$route.path).updateAuth
                            );
                        else
                            return this.checkPermission(
                                findPageByUserAuth(this.$store.getters.userAuth, page).updateAuth
                            );
                    } catch (exception) {
                        console.log(exception);
                        return false
                    }
                },
                checkDeletePermission(page) {
                    try {
                        if (page == null)
                            return this.checkPermission(
                                findPageByUserAuth(this.$store.getters.userAuth, this.$route.path).deleteAuth
                            );
                        else
                            return this.checkPermission(
                                findPageByUserAuth(this.$store.getters.userAuth, page).deleteAuth
                            );
                    } catch (exception) {
                        console.log(exception);
                        return false
                    }
                },
                successPrompt(title = this.$t("Success"), message = "") {
                    this.$notify({
                        title: title,
                        message: message,
                        type: "success",
                    });
                },
                prompt(title = this.$t("Error"), message = "", type = "warning") {
                    this.$notify({
                        title: title,
                        message: message,
                        type: type,
                    });
                },
                deepClone(object) {
                    return JSON.parse(JSON.stringify(object));
                },
                isObjectEmpty(object) {
                    return (
                        Object.keys(object).length === 0 && object.constructor === Object
                    );
                },
                isObjectEquivalent(a, b) {
                    a = JSON.parse(JSON.stringify(a));
                    b = JSON.parse(JSON.stringify(b));
                    var aProps = Object.getOwnPropertyNames(a);
                    var bProps = Object.getOwnPropertyNames(b);
                    if (aProps.length != bProps.length) {
                        return false;
                    }
                    for (var i = 0; i < aProps.length; i++) {
                        var propName = aProps[i];
                        if (a[propName] !== b[propName]) {
                            return false;
                        }
                    }
                    return true;
                },
                checkValidate(propList) {
                    for (let i = 0; i < propList.length; i++) {
                        if (checkValidationRules(this, propList[i]) == false) return false;
                    }
                    return true;
                },
                formatDate(value) {
                    if (value != null) return moment(value).format("yyyy-MM-DD");
                    else return "";
                },
                formatDateTime(value) {
                    if (value != null) {
                        value = new Date();
                        return moment(value).format("yyyy-MM-DD") + " " + value.getHours() + ":" + value.getMinutes() + ":" + value.getSeconds()
                    } else { return "" }
                },
                hashPassword(password) {
                    if (password === "" || password == null) return password;
                    return sha256(password);
                },
                getImgUrl(image) {
                    return require("@/assets/" + image);
                },
                notNullNotEmpty(value) {
                    return !(value == null || value === "" || value.length == 0);
                },
            },
        });
    },
};

function checkValidationRules(vueInstance, prop) {
    for (let i = 0; i < prop.rules.length; i++) {
        var rule = prop.rules[i];
        switch (rule.type) {
            case "REQUIRED":
                if (prop.value == null || prop.value === "") {
                    vueInstance.$message.error(rule.message);
                    return false;
                }
                break;
            case "IS_INT":
                if (!isInt(prop.value)) {
                    vueInstance.$message.error(rule.message);
                    return false;
                }
                break;
            case "CHARACTER_LENGTH_LIMIT":
                if (!isLengthLessThan(prop.value, rule.length)) {
                    vueInstance.$message.error(rule.message);
                    return false;
                }
                break;
            case "ARRAY_LENGTH_SHOULD_LARGER":
                if (!Array.isArray(prop.value) || prop.value.length <= rule.length) {
                    vueInstance.$message.error(rule.message);
                    return false;
                }
                break;
            case "REQUIRED_SOME":
                var validData = [];
                prop.value.forEach(f => {
                    if (f != null && f !== "") { validData.push(f); }
                });
                if (validData.length < rule.required) {
                    vueInstance.$message.error(rule.message);
                    return false;
                }
                break;
        }
    }
    return true;
}

function findPageByUserAuth(userAuthList, page) {
    var userAuth = userAuthList.find((f) => f.page == page)
    if (userAuth == null) throw new Error(page + " is not found")
    return userAuth
}

function isInt(value) {
    return (!isNaN(value) &&
        parseInt(Number(value)) == value &&
        !isNaN(parseInt(value, 10))
    );
}

function isLengthLessThan(value, length) {
    return value.length <= length;
}



export default Plugin;