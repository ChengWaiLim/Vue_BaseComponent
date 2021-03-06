<template>
  <el-dialog :visible="dialogVisible" :width="width" :top="top" @close="handleDialogClose" >
      <div slot="title">
         <h3>Advanced Search</h3>
      </div>
      <div v-for="(item, index) in columnList" :key="index">
        <el-card>
          <h4>{{item.label}}</h4>
            <div v-if="item.hasOwnProperty('advancedSearch')">
                <div v-if="item.advancedSearch.type == 'MULTI-SELECTION'">
                    <el-checkbox-group v-model="searchFilterSet[index]">
                        <el-checkbox v-for="(checkBoxValue, checkBoxIndex) in item.advancedSearch.options" :key="checkBoxIndex" :label="checkBoxValue"></el-checkbox>
                    </el-checkbox-group>
                </div>
                <div v-if="item.advancedSearch.type == 'MULTI-SELECTION-SELECTOR'">
                    <el-select v-model="searchFilterSet[index]" multiple filterable remote>
                        <el-option v-for="(optionValue, optionIndex) in item.advancedSearch.options" :key="optionIndex" :label="optionValue.label" :value="optionValue" />
                    </el-select>
                </div>
                <div v-else-if="item.advancedSearch.type == 'TIME-RANGE'">
                        <el-date-picker
                            v-model="searchFilterSet[index]"
                            type="datetimerange"
                            range-separator="To"
                            start-placeholder="Start"
                            end-placeholder="End">
                        </el-date-picker>
                </div>
                <div v-else-if="item.advancedSearch.type == 'FREETEXT'">
                    <el-input
                        placeholder="Search"
                        v-model="searchFilterSet[index]"
                        clearable>
                    </el-input>
                </div>
                <div v-else-if="item.advancedSearch.type == 'NUMBER-RANGE'">
                    <div class="row">
                        <el-input-number class="mr-16" size="medium" v-model="searchFilterSet[index][0]"></el-input-number>
                        <p>To</p>
                        <el-input-number class="ml-16" size="medium" v-model="searchFilterSet[index][1]"></el-input-number>
                    </div>
                </div>
            </div>
          </el-card>
      </div>
      <el-button @click="handleConfirm">Confirm</el-button>
  </el-dialog>
</template>
<script lang="js">
import Vue from "vue"
import moment from "moment";
import {Util} from "vue_basecomponent";
export default {
    props: {
        dialogVisible: {
            type: Boolean,
            required: true,
            default: false
        },
        columnList: {
            type: Array,
            required: true,
            default: []
        },
        dataList: {
            type: Array,
            required: true,
            default: []
        },
        width: {
            type: String,
            required: false,
            default: '50%'
        },
        top: {
            type: String,
            required: false,
            default: '0vh'
        }
    },
    methods: {
        handleDialogClose() {
            this.$el.scrollTop = 0
            this.$emit('update:dialogVisible', false)
        },
        handleConfirm(){
            var result = this.dataList
            this.columnList.forEach((column, index) => {
                switch(column.advancedSearch.type){
                    case 'MULTI-SELECTION':
                        if(this.searchFilterSet[index].length > 0)
                            result = result.filter(f => {
                                if(column.advancedSearch.customProp != null) f[column.prop] = column.advancedSearch.customProp(f)
                                if(Array.isArray(f[column.prop]))
                                    return f[column.prop].find(prop => this.searchFilterSet[index].includes(prop)) != null
                                else
                                    return this.searchFilterSet[index].includes(f[column.prop])
                            })
                        break;
                    case 'MULTI-SELECTION-SELECTOR':
                        if(this.searchFilterSet[index].length > 0)
                            result = result.filter(f => {
                                if(column.advancedSearch.customProp != null) f[column.prop] = column.advancedSearch.customProp(f)
                                return this.searchFilterSet[index].find(searchSelector => searchSelector.value.includes(f[column.prop])) != null
                            })
                        break;
                    case 'TIME-RANGE':
                        if(this.searchFilterSet[index][0] != null && this.searchFilterSet[index][1] != null)
                            result = result.filter(f => {
                                if(column.advancedSearch.customProp != null) f[column.prop] = column.advancedSearch.customProp(f)
                                moment(f[column.prop]).valueOf() > this.searchFilterSet[index][0].valueOf() && moment(f[column.prop]).valueOf() < this.searchFilterSet[index][1].valueOf()
                            })
                        break
                    case 'FREETEXT':
                        if(this.searchFilterSet[index].length > 0)
                            result = result.filter(f => {
                                if(column.advancedSearch.customProp != null) f[column.prop] = column.advancedSearch.customProp(f)
                                if(f[column.prop] == null || f[column.prop] == "")
                                    return false
                                else
                                    return f[column.prop].includes(this.searchFilterSet[index]) || this.searchFilterSet[index].includes(f[column.prop])
                            })
                        break
                    case 'NUMBER-RANGE':
                        if(this.searchFilterSet[index][0] != null && this.searchFilterSet[index][1] != null)
                            result = result.filter(f => {
                                if(column.advancedSearch.customProp != null) f[column.prop] = column.advancedSearch.customProp(f)
                                if(!Util.isNumeric(f[column.prop]))
                                    return false
                                else
                                    return f[column.prop] >= this.searchFilterSet[index][0] &&  f[column.prop] <= this.searchFilterSet[index][1]
                            })
                        break
                }
            })
            this.$emit('search-callback', result)
            this.$emit('update:dialogVisible', false)
        },
        init(){
            return this.columnList.map(f => {
                switch(f.advancedSearch.type){
                    case 'MULTI-SELECTION':
                        return [];
                        break;
                    case 'MULTI-SELECTION-SELECTOR':
                        return [];
                        break;
                    case 'TIME-RANGE':
                        return [];
                        break;
                    case 'FREETEXT':
                        return "";
                        break;
                    case 'NUMBER-RANGE':
                        return [];
                        break;
                }
            })
        }
    },
    data() {
        return {
            searchFilterSet: this.init(),
        }
    }
}
</script>
<style lang="sass" scoped>
</style>