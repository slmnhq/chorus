# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 0) do

  create_table "browser_type", :id => false, :force => true do |t|
    t.string   "browser_type_id",       :limit => 20,  :null => false
    t.string   "browser_name",          :limit => 100
    t.string   "browser_version",       :limit => 10
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "browser_type", ["created_tx_stamp"], :name => "brwsr_tp_txcrts"
  add_index "browser_type", ["last_updated_tx_stamp"], :name => "brwsr_tp_txstmp"

  create_table "catalina_session", :id => false, :force => true do |t|
    t.string   "session_id",            :limit => 60,                                :null => false
    t.decimal  "session_size",                        :precision => 20, :scale => 0
    t.binary   "session_info"
    t.string   "is_valid",              :limit => 1
    t.decimal  "max_idle",                            :precision => 20, :scale => 0
    t.decimal  "last_accessed",                       :precision => 20, :scale => 0
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "catalina_session", ["created_tx_stamp"], :name => "ctln_sssn_txcrts"
  add_index "catalina_session", ["last_updated_tx_stamp"], :name => "ctln_sssn_txstmp"

  create_table "country_capital", :id => false, :force => true do |t|
    t.string   "country_code",          :limit => 20, :null => false
    t.string   "country_capital"
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "country_capital", ["country_code"], :name => "cntry_cap_to_code"
  add_index "country_capital", ["created_tx_stamp"], :name => "cntr_cptl_txcrts"
  add_index "country_capital", ["last_updated_tx_stamp"], :name => "cntr_cptl_txstmp"

  create_table "country_code", :id => false, :force => true do |t|
    t.string   "country_code",          :limit => 20, :null => false
    t.string   "country_abbr",          :limit => 60
    t.string   "country_number",        :limit => 60
    t.string   "country_name"
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "country_code", ["created_tx_stamp"], :name => "cntr_cd_txcrts"
  add_index "country_code", ["last_updated_tx_stamp"], :name => "cntr_cd_txstmp"

  create_table "country_tele_code", :id => false, :force => true do |t|
    t.string   "country_code",          :limit => 20, :null => false
    t.string   "tele_code",             :limit => 60
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "country_tele_code", ["country_code"], :name => "cntry_tele_to_code"
  add_index "country_tele_code", ["created_tx_stamp"], :name => "cntr_tl_cd_txcrts"
  add_index "country_tele_code", ["last_updated_tx_stamp"], :name => "cntr_tl_cd_txstmp"

  create_table "currency_dimension", :id => false, :force => true do |t|
    t.string   "dimension_id",          :limit => 20, :null => false
    t.string   "currency_id",           :limit => 20
    t.string   "description"
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "currency_dimension", ["created_tx_stamp"], :name => "crrnc_dmnsn_txcrts"
  add_index "currency_dimension", ["last_updated_tx_stamp"], :name => "crrnc_dmnsn_txstmp"

  create_table "custom_method", :id => false, :force => true do |t|
    t.string   "custom_method_id",      :limit => 20, :null => false
    t.string   "custom_method_type_id", :limit => 20
    t.string   "custom_method_name"
    t.string   "description"
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "custom_method", ["created_tx_stamp"], :name => "cstm_mthd_txcrts"
  add_index "custom_method", ["custom_method_type_id"], :name => "cme_to_type"
  add_index "custom_method", ["last_updated_tx_stamp"], :name => "cstm_mthd_txstmp"

  create_table "custom_method_type", :id => false, :force => true do |t|
    t.string   "custom_method_type_id", :limit => 20, :null => false
    t.string   "parent_type_id",        :limit => 20
    t.string   "has_table",             :limit => 1
    t.string   "description"
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "custom_method_type", ["created_tx_stamp"], :name => "cstm_mtd_tp_txcrts"
  add_index "custom_method_type", ["last_updated_tx_stamp"], :name => "cstm_mtd_tp_txstmp"
  add_index "custom_method_type", ["parent_type_id"], :name => "cme_type_parent"

  create_table "custom_time_period", :id => false, :force => true do |t|
    t.string   "custom_time_period_id", :limit => 20,                                 :null => false
    t.string   "parent_period_id",      :limit => 20
    t.string   "period_type_id",        :limit => 20
    t.decimal  "period_num",                           :precision => 20, :scale => 0
    t.string   "period_name",           :limit => 100
    t.date     "from_date"
    t.date     "thru_date"
    t.string   "is_closed",             :limit => 1
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "custom_time_period", ["created_tx_stamp"], :name => "cstm_tm_prd_txcrts"
  add_index "custom_time_period", ["last_updated_tx_stamp"], :name => "cstm_tm_prd_txstmp"
  add_index "custom_time_period", ["parent_period_id"], :name => "org_prd_parper"
  add_index "custom_time_period", ["period_type_id"], :name => "org_prd_pertyp"

  create_table "data_source", :id => false, :force => true do |t|
    t.string   "data_source_id",        :limit => 20, :null => false
    t.string   "data_source_type_id",   :limit => 20
    t.string   "description"
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "data_source", ["created_tx_stamp"], :name => "data_source_txcrts"
  add_index "data_source", ["data_source_type_id"], :name => "data_src_typ"
  add_index "data_source", ["last_updated_tx_stamp"], :name => "data_source_txstmp"

  create_table "data_source_type", :id => false, :force => true do |t|
    t.string   "data_source_type_id",   :limit => 20, :null => false
    t.string   "description"
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "data_source_type", ["created_tx_stamp"], :name => "dt_src_tp_txcrts"
  add_index "data_source_type", ["last_updated_tx_stamp"], :name => "dt_src_tp_txstmp"

  create_table "date_dimension", :id => false, :force => true do |t|
    t.string   "dimension_id",          :limit => 20,                                :null => false
    t.date     "date_value"
    t.string   "description"
    t.string   "day_name",              :limit => 60
    t.decimal  "day_of_month",                        :precision => 20, :scale => 0
    t.decimal  "day_of_year",                         :precision => 20, :scale => 0
    t.string   "month_name",            :limit => 60
    t.decimal  "month_of_year",                       :precision => 20, :scale => 0
    t.decimal  "year_name",                           :precision => 20, :scale => 0
    t.decimal  "week_of_month",                       :precision => 20, :scale => 0
    t.decimal  "week_of_year",                        :precision => 20, :scale => 0
    t.string   "year_month_day",        :limit => 60
    t.string   "year_and_month",        :limit => 60
    t.string   "weekday_type",          :limit => 60
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "date_dimension", ["created_tx_stamp"], :name => "dt_dmnsn_txcrts"
  add_index "date_dimension", ["last_updated_tx_stamp"], :name => "dt_dmnsn_txstmp"

  create_table "edc_account_map", :id => false, :force => true do |t|
    t.string   "id",                    :limit => 20,  :null => false
    t.string   "instance_id",           :limit => 20
    t.string   "user_name",             :limit => 256
    t.string   "db_user_name",          :limit => 256
    t.binary   "db_password"
    t.datetime "expiration"
    t.string   "shared",                :limit => 256
    t.string   "creator",               :limit => 20
    t.binary   "secret_key"
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "edc_account_map", ["created_tx_stamp"], :name => "edc_acct_mp_txcrts"
  add_index "edc_account_map", ["instance_id", "user_name"], :name => "am_index", :unique => true
  add_index "edc_account_map", ["last_updated_tx_stamp"], :name => "edc_acct_mp_txstmp"

  create_table "edc_activity_promote", :id => false, :force => true do |t|
    t.string   "id",                    :limit => 20,  :null => false
    t.string   "entity_type",           :limit => 256
    t.string   "entity_id",             :limit => 256
    t.string   "user_id",               :limit => 256
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "edc_activity_promote", ["created_tx_stamp"], :name => "edc_actt_prt_txcrs"
  add_index "edc_activity_promote", ["last_updated_tx_stamp"], :name => "edc_actt_prt_txstp"

  create_table "edc_activity_stream", :id => false, :force => true do |t|
    t.string   "id",                    :limit => 20,   :null => false
    t.string   "workspace_id",          :limit => 20
    t.string   "entity_type",           :limit => 256
    t.string   "entity_id",             :limit => 256
    t.string   "entity_name",           :limit => 256
    t.string   "prefix_context",        :limit => 4096
    t.text     "suffix_context"
    t.string   "verb",                  :limit => 4096
    t.string   "indirect_verb",         :limit => 4096
    t.string   "type",                  :limit => 4096
    t.string   "author",                :limit => 256
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "edc_activity_stream", ["created_stamp", "id"], :name => "ac_created_stamp_id_idx"
  add_index "edc_activity_stream", ["created_tx_stamp"], :name => "edc_actt_stm_txcrs"
  add_index "edc_activity_stream", ["last_updated_tx_stamp"], :name => "edc_actt_stm_txstp"

  create_table "edc_activity_stream_object", :id => false, :force => true do |t|
    t.string   "id",                    :limit => 20,  :null => false
    t.string   "object_type",           :limit => 256
    t.string   "object_name",           :limit => 256
    t.string   "entity_type",           :limit => 256
    t.string   "object_id",             :limit => 256
    t.string   "workspace_id",          :limit => 20
    t.string   "activity_stream_id",    :limit => 20
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "edc_activity_stream_object", ["activity_stream_id"], :name => "object_activity_stream_fk"
  add_index "edc_activity_stream_object", ["created_tx_stamp"], :name => "edc_act_stm_obt_ts"
  add_index "edc_activity_stream_object", ["last_updated_tx_stamp"], :name => "edc_act_stm_obt_tp"

  create_table "edc_alert", :id => false, :force => true do |t|
    t.string   "id",                    :limit => 20,  :null => false
    t.string   "operator",              :limit => 256
    t.string   "recipient",             :limit => 256
    t.text     "content"
    t.boolean  "is_deleted"
    t.boolean  "is_read"
    t.string   "type",                  :limit => 256
    t.string   "reference",             :limit => 20
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "edc_alert", ["created_tx_stamp"], :name => "edc_alert_txcrts"
  add_index "edc_alert", ["last_updated_tx_stamp"], :name => "edc_alert_txstmp"

  create_table "edc_artifact_class", :id => false, :force => true do |t|
    t.string   "id",                    :limit => 20,  :null => false
    t.string   "artifact",              :limit => 100
    t.string   "path"
    t.string   "description"
    t.string   "parent_id",             :limit => 20
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "edc_artifact_class", ["created_tx_stamp"], :name => "edc_artt_cls_txcrs"
  add_index "edc_artifact_class", ["last_updated_tx_stamp"], :name => "edc_artt_cls_txstp"
  add_index "edc_artifact_class", ["parent_id"], :name => "edc_ac_parent"

  create_table "edc_artifact_class_permission", :id => false, :force => true do |t|
    t.string   "artifact_class_id",     :limit => 20, :null => false
    t.string   "permission_id",         :limit => 20, :null => false
    t.string   "description"
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "edc_artifact_class_permission", ["artifact_class_id"], :name => "edc_ac_permission"
  add_index "edc_artifact_class_permission", ["created_tx_stamp"], :name => "edc_art_cls_prn_ts"
  add_index "edc_artifact_class_permission", ["last_updated_tx_stamp"], :name => "edc_art_cls_prn_tp"
  add_index "edc_artifact_class_permission", ["permission_id"], :name => "edc_perm_acp"

  create_table "edc_comment", :id => false, :force => true do |t|
    t.string   "id",                         :limit => 20,  :null => false
    t.string   "workspace_id",               :limit => 20
    t.string   "entity_type",                :limit => 256
    t.text     "body"
    t.string   "entity_id",                  :limit => 256
    t.string   "entity_name",                :limit => 256
    t.string   "author_name",                :limit => 256
    t.string   "attachment_id",              :limit => 20
    t.string   "parent_comment_id",          :limit => 20
    t.string   "activity_stream_id",         :limit => 20
    t.string   "insight_id",                 :limit => 20
    t.boolean  "is_insight"
    t.datetime "promotion_time"
    t.string   "promotion_actioner",         :limit => 256
    t.boolean  "is_published"
    t.datetime "publish_unpublish_time"
    t.string   "publish_unpublish_actioner", :limit => 256
    t.boolean  "is_deleted"
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "edc_comment", ["attachment_id"], :name => "comment_attachment_id_fk"
  add_index "edc_comment", ["created_stamp", "id"], :name => "comment_created_stamp_id_idx"
  add_index "edc_comment", ["created_tx_stamp"], :name => "edc_comment_txcrts"
  add_index "edc_comment", ["last_updated_tx_stamp"], :name => "edc_comment_txstmp"

  create_table "edc_comment_artifact", :id => false, :force => true do |t|
    t.string   "id",                    :limit => 20,  :null => false
    t.string   "comment_id",            :limit => 20
    t.string   "entity_type",           :limit => 256
    t.string   "workspace_id",          :limit => 20
    t.string   "entity_id",             :limit => 256
    t.boolean  "is_deleted"
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "edc_comment_artifact", ["comment_id"], :name => "comment_fk"
  add_index "edc_comment_artifact", ["created_tx_stamp"], :name => "edc_cmt_artt_txcrs"
  add_index "edc_comment_artifact", ["last_updated_tx_stamp"], :name => "edc_cmt_artt_txstp"

  create_table "edc_database", :id => false, :force => true do |t|
    t.string   "id",                    :limit => 20, :null => false
    t.string   "name",                  :limit => 64
    t.string   "instance_id",           :limit => 20
    t.boolean  "is_deleted"
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "edc_database", ["created_tx_stamp"], :name => "edc_dtbs_txcrts"
  add_index "edc_database", ["instance_id"], :name => "database_instance_fk"
  add_index "edc_database", ["last_updated_tx_stamp"], :name => "edc_dtbs_txstmp"

  create_table "edc_database_account_job", :id => false, :force => true do |t|
    t.string   "id",                    :limit => 20,  :null => false
    t.string   "action",                :limit => 256
    t.string   "user_name",             :limit => 256
    t.string   "instance_id",           :limit => 256
    t.string   "state",                 :limit => 256
    t.text     "comment"
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "edc_database_account_job", ["created_tx_stamp"], :name => "edc_dts_act_jb_txs"
  add_index "edc_database_account_job", ["instance_id"], :name => "db_acct_inst_fk"
  add_index "edc_database_account_job", ["last_updated_tx_stamp"], :name => "edc_dts_act_jb_txp"

  create_table "edc_dataset", :id => false, :force => true do |t|
    t.string   "id",                    :limit => 20,  :null => false
    t.string   "composite_id",          :limit => 512
    t.string   "type",                  :limit => 256, :null => false
    t.string   "owner_id",              :limit => 20,  :null => false
    t.string   "modified_by_id",        :limit => 20,  :null => false
    t.string   "instance_id",           :limit => 20,  :null => false
    t.string   "database_name",         :limit => 64,  :null => false
    t.string   "schema_name",           :limit => 64,  :null => false
    t.string   "object_name",           :limit => 64,  :null => false
    t.string   "object_type",           :limit => 64
    t.text     "query"
    t.string   "workspace_id",          :limit => 20,  :null => false
    t.string   "data_import_id",        :limit => 20
    t.boolean  "is_deleted",                           :null => false
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "edc_dataset", ["composite_id"], :name => "dataset_composite_idx"
  add_index "edc_dataset", ["created_tx_stamp"], :name => "edc_dataset_txcrts"
  add_index "edc_dataset", ["data_import_id"], :name => "dataset_import_fk"
  add_index "edc_dataset", ["instance_id"], :name => "dataset_instance_fk"
  add_index "edc_dataset", ["last_updated_tx_stamp"], :name => "edc_dataset_txstmp"
  add_index "edc_dataset", ["modified_by_id"], :name => "dataset_modifiedby_fk"
  add_index "edc_dataset", ["owner_id"], :name => "dataset_owner_fk"
  add_index "edc_dataset", ["type", "workspace_id"], :name => "dataset_name_idx"
  add_index "edc_dataset", ["workspace_id"], :name => "dataset_workspace_fk"

  create_table "edc_dynamic_group", :id => false, :force => true do |t|
    t.string   "id",                    :limit => 20,  :null => false
    t.string   "dynamic_group",         :limit => 100
    t.string   "description"
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "edc_dynamic_group", ["created_tx_stamp"], :name => "edc_dnc_grp_txcrts"
  add_index "edc_dynamic_group", ["last_updated_tx_stamp"], :name => "edc_dnc_grp_txstmp"

  create_table "edc_file", :id => false, :force => true do |t|
    t.string   "id",                    :limit => 20,  :null => false
    t.string   "user_name",             :limit => 256
    t.binary   "file"
    t.text     "file_name"
    t.text     "file_display_name"
    t.string   "type",                  :limit => 256
    t.string   "file_type",             :limit => 256
    t.boolean  "is_binary"
    t.boolean  "is_deleted"
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
    t.binary   "thumbnail"
  end

  add_index "edc_file", ["created_tx_stamp"], :name => "edc_file_txcrts"
  add_index "edc_file", ["last_updated_tx_stamp"], :name => "edc_file_txstmp"

  create_table "edc_image", :id => false, :force => true do |t|
    t.string   "id",                    :limit => 20,   :null => false
    t.string   "user_name",             :limit => 256
    t.string   "image_name",            :limit => 256
    t.string   "type",                  :limit => 4096
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "edc_image", ["created_tx_stamp"], :name => "edc_image_txcrts"
  add_index "edc_image", ["last_updated_tx_stamp"], :name => "edc_image_txstmp"

  create_table "edc_image_instance", :id => false, :force => true do |t|
    t.string   "id",                    :limit => 20,  :null => false
    t.string   "image_id",              :limit => 20
    t.integer  "resolution_length"
    t.integer  "resolution_width"
    t.integer  "length"
    t.integer  "width"
    t.string   "type",                  :limit => 256
    t.integer  "size"
    t.binary   "image"
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "edc_image_instance", ["created_tx_stamp"], :name => "edc_img_insc_txcrs"
  add_index "edc_image_instance", ["last_updated_tx_stamp"], :name => "edc_img_insc_txstp"

  create_table "edc_import", :id => false, :force => true do |t|
    t.string   "id",                    :limit => 20,  :null => false
    t.string   "source_type",           :limit => 256
    t.string   "workspace_id",          :limit => 20
    t.string   "source_id",             :limit => 512
    t.string   "to_table",              :limit => 64
    t.string   "sample_method",         :limit => 256
    t.float    "sample_count"
    t.boolean  "truncate"
    t.string   "schedule_id",           :limit => 20
    t.string   "gpfdist_type",          :limit => 256
    t.boolean  "is_deleted"
    t.string   "latest_task_id",        :limit => 20
    t.string   "owner_id",              :limit => 20
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "edc_import", ["created_tx_stamp"], :name => "edc_import_txcrts"
  add_index "edc_import", ["last_updated_tx_stamp"], :name => "edc_import_txstmp"
  add_index "edc_import", ["latest_task_id"], :name => "import_task_fk"
  add_index "edc_import", ["owner_id"], :name => "import_user_fk"
  add_index "edc_import", ["schedule_id"], :name => "import_schedule_fk"
  add_index "edc_import", ["workspace_id"], :name => "import_workspace_fk"

  create_table "edc_import_file_column", :id => false, :force => true do |t|
    t.string   "id",                    :limit => 20,  :null => false
    t.string   "import_id",             :limit => 20
    t.integer  "column_order"
    t.string   "column_name",           :limit => 256
    t.string   "column_type",           :limit => 256
    t.string   "date_format",           :limit => 256
    t.boolean  "is_deleted"
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "edc_import_file_column", ["created_tx_stamp"], :name => "edc_imt_fl_cln_txs"
  add_index "edc_import_file_column", ["import_id"], :name => "import_file_column_import_fk"
  add_index "edc_import_file_column", ["last_updated_tx_stamp"], :name => "edc_imt_fl_cln_txp"

  create_table "edc_import_file_info", :id => false, :force => true do |t|
    t.string   "id",                    :limit => 20,  :null => false
    t.string   "import_id",             :limit => 20
    t.string   "name",                  :limit => 256
    t.string   "value",                 :limit => 256
    t.boolean  "is_deleted"
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "edc_import_file_info", ["created_tx_stamp"], :name => "edc_imt_fl_inf_txs"
  add_index "edc_import_file_info", ["import_id"], :name => "import_file_info_import_fk"
  add_index "edc_import_file_info", ["last_updated_tx_stamp"], :name => "edc_imt_fl_inf_txp"

  create_table "edc_import_schedule", :id => false, :force => true do |t|
    t.string   "id",                    :limit => 20,   :null => false
    t.string   "job_name",              :limit => 256
    t.datetime "start_time"
    t.date     "end_time"
    t.integer  "frequency"
    t.integer  "interval"
    t.string   "days",                  :limit => 4096
    t.boolean  "is_deleted"
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "edc_import_schedule", ["created_tx_stamp"], :name => "edc_impt_scl_txcrs"
  add_index "edc_import_schedule", ["last_updated_tx_stamp"], :name => "edc_impt_scl_txstp"

  create_table "edc_insight", :id => false, :force => true do |t|
    t.string   "id",                    :limit => 20,  :null => false
    t.string   "workspace_id",          :limit => 20
    t.text     "name"
    t.text     "text"
    t.string   "image_id",              :limit => 20
    t.string   "file_id",               :limit => 20
    t.string   "author",                :limit => 256
    t.boolean  "is_published"
    t.boolean  "is_deleted"
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "edc_insight", ["created_tx_stamp"], :name => "edc_insight_txcrts"
  add_index "edc_insight", ["file_id"], :name => "insight_file_fk"
  add_index "edc_insight", ["image_id"], :name => "insight_image_fk"
  add_index "edc_insight", ["last_updated_tx_stamp"], :name => "edc_insight_txstmp"
  add_index "edc_insight", ["workspace_id"], :name => "insight_workspace_fk"

  create_table "edc_insight_like", :id => false, :force => true do |t|
    t.string   "id",                    :limit => 20,  :null => false
    t.datetime "like_time"
    t.string   "insight_id",            :limit => 20
    t.string   "who",                   :limit => 256
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "edc_insight_like", ["created_tx_stamp"], :name => "edc_insgt_lk_txcrs"
  add_index "edc_insight_like", ["last_updated_tx_stamp"], :name => "edc_insgt_lk_txstp"

  create_table "edc_instance", :id => false, :force => true do |t|
    t.string   "id",                    :limit => 20,  :null => false
    t.string   "name",                  :limit => 256
    t.text     "description"
    t.string   "owner",                 :limit => 256
    t.string   "host",                  :limit => 256
    t.integer  "port"
    t.date     "expire"
    t.string   "state",                 :limit => 256
    t.string   "provision_type",        :limit => 256
    t.string   "provision_id",          :limit => 20
    t.integer  "size"
    t.string   "instance_provider",     :limit => 256
    t.datetime "last_check"
    t.integer  "free_space"
    t.integer  "total_object"
    t.string   "provision_name",        :limit => 256
    t.boolean  "is_deleted"
    t.string   "instance_version",      :limit => 256
    t.string   "maintenance_db",        :limit => 256
    t.string   "connection_string",     :limit => 256
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "edc_instance", ["created_tx_stamp"], :name => "edc_instnc_txcrts"
  add_index "edc_instance", ["host", "port"], :name => "instance_host_port_idx"
  add_index "edc_instance", ["last_updated_tx_stamp"], :name => "edc_instnc_txstmp"
  add_index "edc_instance", ["name"], :name => "instance_name_idx", :unique => true

  create_table "edc_login_token", :id => false, :force => true do |t|
    t.string   "user_name",             :limit => 256, :null => false
    t.string   "client_ip",             :limit => 256, :null => false
    t.string   "user_agent",            :limit => 256, :null => false
    t.text     "token"
    t.datetime "last_access_time"
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "edc_login_token", ["created_tx_stamp"], :name => "edc_lgn_tkn_txcrts"
  add_index "edc_login_token", ["last_updated_tx_stamp"], :name => "edc_lgn_tkn_txstmp"
  add_index "edc_login_token", ["token"], :name => "login_token", :unique => true

  create_table "edc_member", :id => false, :force => true do |t|
    t.string   "id",                    :limit => 20,  :null => false
    t.string   "workspace_id",          :limit => 20
    t.string   "member_name",           :limit => 256
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "edc_member", ["created_tx_stamp"], :name => "edc_member_txcrts"
  add_index "edc_member", ["last_updated_tx_stamp"], :name => "edc_member_txstmp"
  add_index "edc_member", ["member_name", "workspace_id"], :name => "member_name_idx", :unique => true
  add_index "edc_member", ["workspace_id"], :name => "workspace_id_fk"

  create_table "edc_permission", :id => false, :force => true do |t|
    t.string   "id",                    :limit => 20,  :null => false
    t.string   "permission",            :limit => 100
    t.string   "description"
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "edc_permission", ["created_tx_stamp"], :name => "edc_prmssn_txcrts"
  add_index "edc_permission", ["last_updated_tx_stamp"], :name => "edc_prmssn_txstmp"

  create_table "edc_permission_matrix", :id => false, :force => true do |t|
    t.string   "id",                    :limit => 20
    t.string   "artifact_class_id",     :limit => 20, :null => false
    t.string   "group_id",              :limit => 20, :null => false
    t.string   "permission_id",         :limit => 20, :null => false
    t.string   "description"
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "edc_permission_matrix", ["artifact_class_id"], :name => "edc_ac_matrix"
  add_index "edc_permission_matrix", ["created_tx_stamp"], :name => "edc_prmn_mtx_txcrs"
  add_index "edc_permission_matrix", ["group_id"], :name => "edc_group_matrix"
  add_index "edc_permission_matrix", ["last_updated_tx_stamp"], :name => "edc_prmn_mtx_txstp"
  add_index "edc_permission_matrix", ["permission_id"], :name => "edc_perm_matrix"

  create_table "edc_sandbox", :id => false, :force => true do |t|
    t.string   "id",                    :limit => 20,  :null => false
    t.string   "workspace_id",          :limit => 20
    t.string   "instance_id",           :limit => 20
    t.string   "database_id",           :limit => 20
    t.string   "schema_id",             :limit => 20
    t.string   "instance_name",         :limit => 256
    t.string   "database_name",         :limit => 64
    t.string   "schema_name",           :limit => 64
    t.string   "state",                 :limit => 256
    t.string   "type",                  :limit => 10
    t.boolean  "is_deleted"
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "edc_sandbox", ["created_tx_stamp"], :name => "edc_sandbox_txcrts"
  add_index "edc_sandbox", ["database_id"], :name => "sandbox_database_fk"
  add_index "edc_sandbox", ["instance_id"], :name => "sandbox_instance_fk"
  add_index "edc_sandbox", ["last_updated_tx_stamp"], :name => "edc_sandbox_txstmp"
  add_index "edc_sandbox", ["schema_id"], :name => "sandbox_schema_fk"
  add_index "edc_sandbox", ["workspace_id"], :name => "sandbox_workspace_fk"

  create_table "edc_schema", :id => false, :force => true do |t|
    t.string   "id",                    :limit => 20, :null => false
    t.string   "name",                  :limit => 64
    t.string   "database_id",           :limit => 20
    t.boolean  "is_deleted"
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "edc_schema", ["created_tx_stamp"], :name => "edc_schema_txcrts"
  add_index "edc_schema", ["database_id"], :name => "schema_database_fk"
  add_index "edc_schema", ["last_updated_tx_stamp"], :name => "edc_schema_txstmp"

  create_table "edc_schema_version", :id => false, :force => true do |t|
    t.string   "id",                    :limit => 20, :null => false
    t.integer  "schema_version"
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "edc_schema_version", ["created_tx_stamp"], :name => "edc_scm_vrn_txcrts"
  add_index "edc_schema_version", ["last_updated_tx_stamp"], :name => "edc_scm_vrn_txstmp"

  create_table "edc_search_last_read", :id => false, :force => true do |t|
    t.string   "id",                    :limit => 20,  :null => false
    t.string   "doc_type",              :limit => 256
    t.string   "doc_id",                :limit => 256
    t.datetime "last_read"
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "edc_search_last_read", ["created_tx_stamp"], :name => "edc_srh_lst_rd_txs"
  add_index "edc_search_last_read", ["last_updated_tx_stamp"], :name => "edc_srh_lst_rd_txp"

  create_table "edc_task", :id => false, :force => true do |t|
    t.string   "id",                    :limit => 20,  :null => false
    t.string   "creator",               :limit => 20,  :null => false
    t.boolean  "sync"
    t.string   "task_type",             :limit => 256
    t.string   "entity_id",             :limit => 256
    t.string   "instance_id",           :limit => 20
    t.string   "database_id",           :limit => 20
    t.string   "schema_id",             :limit => 20
    t.integer  "version_num"
    t.datetime "started_stamp"
    t.datetime "completed_stamp"
    t.integer  "time_span"
    t.string   "state",                 :limit => 256
    t.text     "result"
    t.text     "sql"
    t.boolean  "is_deleted"
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "edc_task", ["created_tx_stamp"], :name => "edc_task_txcrts"
  add_index "edc_task", ["creator"], :name => "task_creator_fk"
  add_index "edc_task", ["last_updated_tx_stamp"], :name => "edc_task_txstmp"

  create_table "edc_user", :id => false, :force => true do |t|
    t.string   "id",                    :limit => 20,   :null => false
    t.string   "user_name",             :limit => 256
    t.string   "first_name",            :limit => 256
    t.string   "last_name",             :limit => 256
    t.binary   "symmetric_password"
    t.text     "password"
    t.string   "email_address"
    t.string   "title",                 :limit => 256
    t.string   "ou",                    :limit => 256
    t.string   "manager",               :limit => 256
    t.string   "street_address",        :limit => 4096
    t.string   "l",                     :limit => 256
    t.string   "st",                    :limit => 256
    t.string   "c",                     :limit => 256
    t.boolean  "admin"
    t.text     "notes"
    t.datetime "last_login"
    t.string   "image_id",              :limit => 20
    t.string   "dn",                    :limit => 256
    t.boolean  "is_deleted"
    t.string   "dumb",                  :limit => 256
    t.binary   "secret_key"
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "edc_user", ["created_tx_stamp"], :name => "edc_user_txcrts"
  add_index "edc_user", ["last_updated_tx_stamp"], :name => "edc_user_txstmp"
  add_index "edc_user", ["user_name"], :name => "user_name_idx", :unique => true

  create_table "edc_work_file", :id => false, :force => true do |t|
    t.string   "id",                    :limit => 20,  :null => false
    t.text     "file_name"
    t.string   "mime_type",             :limit => 256
    t.string   "file_type",             :limit => 256
    t.boolean  "is_binary"
    t.string   "workspace_id",          :limit => 20
    t.string   "source",                :limit => 256
    t.string   "owner",                 :limit => 256
    t.text     "description"
    t.integer  "latest_version_num"
    t.boolean  "is_deleted"
    t.string   "modified_by",           :limit => 256
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "edc_work_file", ["created_tx_stamp"], :name => "edc_wrk_fl_txcrts"
  add_index "edc_work_file", ["last_updated_tx_stamp"], :name => "edc_wrk_fl_txstmp"
  add_index "edc_work_file", ["workspace_id"], :name => "workfile_space_fk"

  create_table "edc_workfile_draft", :id => false, :force => true do |t|
    t.string   "id",                    :limit => 20,  :null => false
    t.string   "workfile_id",           :limit => 20
    t.integer  "base_version_num"
    t.string   "draft_file_id",         :limit => 20
    t.string   "draft_owner",           :limit => 256
    t.boolean  "is_deleted"
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "edc_workfile_draft", ["created_tx_stamp"], :name => "edc_wrkl_drt_txcrs"
  add_index "edc_workfile_draft", ["last_updated_tx_stamp"], :name => "edc_wrkl_drt_txstp"
  add_index "edc_workfile_draft", ["workfile_id"], :name => "draft_workfile_fk"

  create_table "edc_workfile_version", :id => false, :force => true do |t|
    t.string   "id",                    :limit => 20,  :null => false
    t.string   "workfile_id",           :limit => 20
    t.integer  "version_num"
    t.string   "version_file_id",       :limit => 20
    t.string   "version_owner",         :limit => 256
    t.boolean  "is_deleted"
    t.text     "commit_message"
    t.string   "modified_by",           :limit => 256
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
    t.binary   "thumbnail"
  end

  add_index "edc_workfile_version", ["created_tx_stamp"], :name => "edc_wrkl_vrn_txcrs"
  add_index "edc_workfile_version", ["last_updated_tx_stamp"], :name => "edc_wrkl_vrn_txstp"
  add_index "edc_workfile_version", ["workfile_id", "version_num"], :name => "workfile_version_idx", :unique => true
  add_index "edc_workfile_version", ["workfile_id"], :name => "version_workfile_fk"

  create_table "edc_workspace", :id => false, :force => true do |t|
    t.string   "id",                    :limit => 20,  :null => false
    t.string   "name",                  :limit => 256
    t.string   "owner",                 :limit => 256
    t.boolean  "is_public"
    t.string   "icon_id",               :limit => 20
    t.integer  "state"
    t.string   "sandbox_id",            :limit => 20
    t.text     "summary"
    t.boolean  "is_deleted"
    t.string   "archiver",              :limit => 256
    t.datetime "archived_timestamp"
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "edc_workspace", ["created_tx_stamp"], :name => "edc_wrkspc_txcrts"
  add_index "edc_workspace", ["last_updated_tx_stamp"], :name => "edc_wrkspc_txstmp"
  add_index "edc_workspace", ["name"], :name => "workspace_name_idx", :unique => true
  add_index "edc_workspace", ["sandbox_id"], :name => "workspace_sandbox_fk"

  create_table "email_template_setting", :id => false, :force => true do |t|
    t.string   "email_template_setting_id",    :limit => 20, :null => false
    t.string   "description"
    t.string   "body_screen_location"
    t.string   "xslfo_attach_screen_location"
    t.string   "from_address"
    t.string   "cc_address"
    t.string   "bcc_address"
    t.string   "subject"
    t.string   "content_type"
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "email_template_setting", ["created_tx_stamp"], :name => "eml_tmpt_stg_txcrs"
  add_index "email_template_setting", ["last_updated_tx_stamp"], :name => "eml_tmpt_stg_txstp"

  create_table "entity_audit_log", :id => false, :force => true do |t|
    t.string   "audit_history_seq_id",   :limit => 20, :null => false
    t.string   "changed_entity_name"
    t.string   "changed_field_name"
    t.string   "pk_combined_value_text"
    t.string   "old_value_text"
    t.string   "new_value_text"
    t.datetime "changed_date"
    t.string   "changed_by_info"
    t.string   "changed_session_info"
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "entity_audit_log", ["created_tx_stamp"], :name => "entt_adt_lg_txcrts"
  add_index "entity_audit_log", ["last_updated_tx_stamp"], :name => "entt_adt_lg_txstmp"

  create_table "entity_group", :id => false, :force => true do |t|
    t.string   "entity_group_id",       :limit => 20,  :null => false
    t.string   "entity_group_name",     :limit => 100
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "entity_group", ["created_tx_stamp"], :name => "entt_grp_txcrts"
  add_index "entity_group", ["last_updated_tx_stamp"], :name => "entt_grp_txstmp"

  create_table "entity_group_entry", :id => false, :force => true do |t|
    t.string   "entity_group_id",       :limit => 20, :null => false
    t.string   "entity_or_package",                   :null => false
    t.string   "appl_enum_id",          :limit => 20
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "entity_group_entry", ["created_tx_stamp"], :name => "ent_grp_enr_txcrts"
  add_index "entity_group_entry", ["entity_group_id"], :name => "entgrp_grp"
  add_index "entity_group_entry", ["last_updated_tx_stamp"], :name => "ent_grp_enr_txstmp"

  create_table "entity_key_store", :id => false, :force => true do |t|
    t.string   "key_name",              :null => false
    t.string   "key_text"
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "entity_key_store", ["created_tx_stamp"], :name => "entt_k_str_txcrts"
  add_index "entity_key_store", ["last_updated_tx_stamp"], :name => "entt_k_str_txstmp"

  create_table "entity_sync", :id => false, :force => true do |t|
    t.string   "entity_sync_id",               :limit => 20,                                :null => false
    t.string   "run_status_id",                :limit => 20
    t.datetime "last_successful_synch_time"
    t.datetime "last_history_start_date"
    t.datetime "pre_offline_synch_time"
    t.decimal  "offline_sync_split_millis",                  :precision => 20, :scale => 0
    t.decimal  "sync_split_millis",                          :precision => 20, :scale => 0
    t.decimal  "sync_end_buffer_millis",                     :precision => 20, :scale => 0
    t.decimal  "max_running_no_update_millis",               :precision => 20, :scale => 0
    t.string   "target_service_name"
    t.string   "target_delegator_name"
    t.float    "keep_remove_info_hours"
    t.string   "for_pull_only",                :limit => 1
    t.string   "for_push_only",                :limit => 1
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "entity_sync", ["created_tx_stamp"], :name => "entity_sync_txcrts"
  add_index "entity_sync", ["last_updated_tx_stamp"], :name => "entity_sync_txstmp"

  create_table "entity_sync_history", :id => false, :force => true do |t|
    t.string   "entity_sync_id",             :limit => 20,                                :null => false
    t.datetime "start_date",                                                              :null => false
    t.string   "run_status_id",              :limit => 20
    t.datetime "beginning_synch_time"
    t.datetime "last_successful_synch_time"
    t.datetime "last_candidate_end_time"
    t.decimal  "last_split_start_time",                    :precision => 20, :scale => 0
    t.decimal  "to_create_inserted",                       :precision => 20, :scale => 0
    t.decimal  "to_create_updated",                        :precision => 20, :scale => 0
    t.decimal  "to_create_not_updated",                    :precision => 20, :scale => 0
    t.decimal  "to_store_inserted",                        :precision => 20, :scale => 0
    t.decimal  "to_store_updated",                         :precision => 20, :scale => 0
    t.decimal  "to_store_not_updated",                     :precision => 20, :scale => 0
    t.decimal  "to_remove_deleted",                        :precision => 20, :scale => 0
    t.decimal  "to_remove_already_deleted",                :precision => 20, :scale => 0
    t.decimal  "total_rows_exported",                      :precision => 20, :scale => 0
    t.decimal  "total_rows_to_create",                     :precision => 20, :scale => 0
    t.decimal  "total_rows_to_store",                      :precision => 20, :scale => 0
    t.decimal  "total_rows_to_remove",                     :precision => 20, :scale => 0
    t.decimal  "total_splits",                             :precision => 20, :scale => 0
    t.decimal  "total_store_calls",                        :precision => 20, :scale => 0
    t.decimal  "running_time_millis",                      :precision => 20, :scale => 0
    t.decimal  "per_split_min_millis",                     :precision => 20, :scale => 0
    t.decimal  "per_split_max_millis",                     :precision => 20, :scale => 0
    t.decimal  "per_split_min_items",                      :precision => 20, :scale => 0
    t.decimal  "per_split_max_items",                      :precision => 20, :scale => 0
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "entity_sync_history", ["created_tx_stamp"], :name => "ent_snc_hsr_txcrts"
  add_index "entity_sync_history", ["entity_sync_id"], :name => "entsync_hstsnc"
  add_index "entity_sync_history", ["last_updated_tx_stamp"], :name => "ent_snc_hsr_txstmp"

  create_table "entity_sync_include", :id => false, :force => true do |t|
    t.string   "entity_sync_id",        :limit => 20, :null => false
    t.string   "entity_or_package",                   :null => false
    t.string   "appl_enum_id",          :limit => 20
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "entity_sync_include", ["created_tx_stamp"], :name => "ent_snc_incd_txcrs"
  add_index "entity_sync_include", ["entity_sync_id"], :name => "entsync_incsnc"
  add_index "entity_sync_include", ["last_updated_tx_stamp"], :name => "ent_snc_incd_txstp"

  create_table "entity_sync_include_group", :id => false, :force => true do |t|
    t.string   "entity_sync_id",        :limit => 20, :null => false
    t.string   "entity_group_id",       :limit => 20, :null => false
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "entity_sync_include_group", ["created_tx_stamp"], :name => "ent_snc_ind_grp_ts"
  add_index "entity_sync_include_group", ["entity_group_id"], :name => "entsncgu_grp"
  add_index "entity_sync_include_group", ["entity_sync_id"], :name => "entsncgu_snc"
  add_index "entity_sync_include_group", ["last_updated_tx_stamp"], :name => "ent_snc_ind_grp_tp"

  create_table "entity_sync_remove", :id => false, :force => true do |t|
    t.string   "entity_sync_remove_id", :limit => 20, :null => false
    t.text     "primary_key_removed"
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "entity_sync_remove", ["created_tx_stamp"], :name => "ent_snc_rmv_txcrts"
  add_index "entity_sync_remove", ["last_updated_tx_stamp"], :name => "ent_snc_rmv_txstmp"

  create_table "enumeration", :id => false, :force => true do |t|
    t.string   "enum_id",               :limit => 20, :null => false
    t.string   "enum_type_id",          :limit => 20
    t.string   "enum_code",             :limit => 60
    t.string   "sequence_id",           :limit => 20
    t.string   "description"
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "enumeration", ["created_tx_stamp"], :name => "enumeration_txcrts"
  add_index "enumeration", ["enum_type_id"], :name => "enum_to_type"
  add_index "enumeration", ["last_updated_tx_stamp"], :name => "enumeration_txstmp"

  create_table "enumeration_type", :id => false, :force => true do |t|
    t.string   "enum_type_id",          :limit => 20, :null => false
    t.string   "parent_type_id",        :limit => 20
    t.string   "has_table",             :limit => 1
    t.string   "description"
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "enumeration_type", ["created_tx_stamp"], :name => "enmrtn_tp_txcrts"
  add_index "enumeration_type", ["last_updated_tx_stamp"], :name => "enmrtn_tp_txstmp"
  add_index "enumeration_type", ["parent_type_id"], :name => "enum_type_parent"

  create_table "geo", :id => false, :force => true do |t|
    t.string   "geo_id",                :limit => 20,  :null => false
    t.string   "geo_type_id",           :limit => 20
    t.string   "geo_name",              :limit => 100
    t.string   "geo_code",              :limit => 60
    t.string   "geo_sec_code",          :limit => 60
    t.string   "abbreviation",          :limit => 60
    t.text     "well_known_text"
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "geo", ["created_tx_stamp"], :name => "geo_txcrts"
  add_index "geo", ["geo_type_id"], :name => "geo_to_type"
  add_index "geo", ["last_updated_tx_stamp"], :name => "geo_txstmp"

  create_table "geo_assoc", :id => false, :force => true do |t|
    t.string   "geo_id",                :limit => 20, :null => false
    t.string   "geo_id_to",             :limit => 20, :null => false
    t.string   "geo_assoc_type_id",     :limit => 20
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "geo_assoc", ["created_tx_stamp"], :name => "geo_assoc_txcrts"
  add_index "geo_assoc", ["geo_assoc_type_id"], :name => "geo_assc_to_type"
  add_index "geo_assoc", ["geo_id"], :name => "geo_assc_to_main"
  add_index "geo_assoc", ["geo_id_to"], :name => "geo_assc_to_assc"
  add_index "geo_assoc", ["last_updated_tx_stamp"], :name => "geo_assoc_txstmp"

  create_table "geo_assoc_type", :id => false, :force => true do |t|
    t.string   "geo_assoc_type_id",     :limit => 20, :null => false
    t.string   "description"
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "geo_assoc_type", ["created_tx_stamp"], :name => "g_assc_tp_txcrts"
  add_index "geo_assoc_type", ["last_updated_tx_stamp"], :name => "g_assc_tp_txstmp"

  create_table "geo_point", :id => false, :force => true do |t|
    t.string   "geo_point_id",          :limit => 20, :null => false
    t.string   "data_source_id",        :limit => 20
    t.float    "latitude",                            :null => false
    t.float    "longitude",                           :null => false
    t.float    "elevation"
    t.string   "elevation_uom_id",      :limit => 20
    t.string   "information"
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "geo_point", ["created_tx_stamp"], :name => "geo_point_txcrts"
  add_index "geo_point", ["data_source_id"], :name => "geopoint_dtsrc"
  add_index "geo_point", ["elevation_uom_id"], :name => "gpt_type_uom"
  add_index "geo_point", ["last_updated_tx_stamp"], :name => "geo_point_txstmp"

  create_table "geo_type", :id => false, :force => true do |t|
    t.string   "geo_type_id",           :limit => 20, :null => false
    t.string   "parent_type_id",        :limit => 20
    t.string   "has_table",             :limit => 1
    t.string   "description"
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "geo_type", ["created_tx_stamp"], :name => "geo_type_txcrts"
  add_index "geo_type", ["last_updated_tx_stamp"], :name => "geo_type_txstmp"
  add_index "geo_type", ["parent_type_id"], :name => "geo_type_parent"

  create_table "job_sandbox", :id => false, :force => true do |t|
    t.string   "job_id",                   :limit => 20,                                 :null => false
    t.string   "job_name",                 :limit => 100
    t.datetime "run_time"
    t.string   "pool_id",                  :limit => 100
    t.string   "status_id",                :limit => 20
    t.string   "parent_job_id",            :limit => 20
    t.string   "previous_job_id",          :limit => 20
    t.string   "service_name",             :limit => 100
    t.string   "loader_name",              :limit => 100
    t.decimal  "max_retry",                               :precision => 20, :scale => 0
    t.string   "auth_user_login_id"
    t.string   "run_as_user"
    t.string   "runtime_data_id",          :limit => 20
    t.string   "recurrence_info_id",       :limit => 20
    t.string   "temp_expr_id",             :limit => 20
    t.decimal  "current_recurrence_count",                :precision => 20, :scale => 0
    t.decimal  "max_recurrence_count",                    :precision => 20, :scale => 0
    t.string   "run_by_instance_id",       :limit => 20
    t.datetime "start_date_time"
    t.datetime "finish_date_time"
    t.datetime "cancel_date_time"
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "job_sandbox", ["auth_user_login_id"], :name => "job_sndbx_ausrlgn"
  add_index "job_sandbox", ["created_tx_stamp"], :name => "job_sandbox_txcrts"
  add_index "job_sandbox", ["last_updated_tx_stamp"], :name => "job_sandbox_txstmp"
  add_index "job_sandbox", ["recurrence_info_id"], :name => "job_sndbx_recinfo"
  add_index "job_sandbox", ["run_as_user"], :name => "job_sndbx_usrlgn"
  add_index "job_sandbox", ["run_by_instance_id", "status_id"], :name => "job_sndbx_runstat"
  add_index "job_sandbox", ["runtime_data_id"], :name => "job_sndbx_rntmdta"
  add_index "job_sandbox", ["status_id"], :name => "job_sndbx_stts"
  add_index "job_sandbox", ["temp_expr_id"], :name => "job_sndbx_tempexpr"

  create_table "keyword_thesaurus", :id => false, :force => true do |t|
    t.string   "entered_keyword",                     :null => false
    t.string   "alternate_keyword",                   :null => false
    t.string   "relationship_enum_id",  :limit => 20
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "keyword_thesaurus", ["created_tx_stamp"], :name => "kwrd_thsrs_txcrts"
  add_index "keyword_thesaurus", ["last_updated_tx_stamp"], :name => "kwrd_thsrs_txstmp"
  add_index "keyword_thesaurus", ["relationship_enum_id"], :name => "kw_thrs_rlenm"

  create_table "note_data", :id => false, :force => true do |t|
    t.string   "note_id",               :limit => 20,  :null => false
    t.string   "note_name",             :limit => 100
    t.text     "note_info"
    t.datetime "note_date_time"
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "note_data", ["created_tx_stamp"], :name => "note_data_txcrts"
  add_index "note_data", ["last_updated_tx_stamp"], :name => "note_data_txstmp"

  create_table "period_type", :id => false, :force => true do |t|
    t.string   "period_type_id",        :limit => 20,                                :null => false
    t.string   "description"
    t.decimal  "period_length",                       :precision => 20, :scale => 0
    t.string   "uom_id",                :limit => 20
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "period_type", ["created_tx_stamp"], :name => "period_type_txcrts"
  add_index "period_type", ["last_updated_tx_stamp"], :name => "period_type_txstmp"
  add_index "period_type", ["uom_id"], :name => "per_type_uom"

  create_table "platform_type", :id => false, :force => true do |t|
    t.string   "platform_type_id",      :limit => 20,  :null => false
    t.string   "platform_name",         :limit => 100
    t.string   "platform_version",      :limit => 10
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "platform_type", ["created_tx_stamp"], :name => "pltfrm_tp_txcrts"
  add_index "platform_type", ["last_updated_tx_stamp"], :name => "pltfrm_tp_txstmp"

  create_table "portal_page", :id => false, :force => true do |t|
    t.string   "portal_page_id",          :limit => 20,                                 :null => false
    t.string   "portal_page_name",        :limit => 100
    t.string   "description"
    t.string   "owner_user_login_id",     :limit => 20
    t.string   "original_portal_page_id", :limit => 20
    t.string   "parent_portal_page_id",   :limit => 20
    t.decimal  "sequence_num",                           :precision => 20, :scale => 0
    t.string   "security_group_id",       :limit => 20
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "portal_page", ["created_tx_stamp"], :name => "portal_page_txcrts"
  add_index "portal_page", ["last_updated_tx_stamp"], :name => "portal_page_txstmp"
  add_index "portal_page", ["parent_portal_page_id"], :name => "portpage_parent"
  add_index "portal_page", ["security_group_id"], :name => "portpage_secgrp"

  create_table "portal_page_column", :id => false, :force => true do |t|
    t.string   "portal_page_id",          :limit => 20,                                :null => false
    t.string   "column_seq_id",           :limit => 20,                                :null => false
    t.decimal  "column_width_pixels",                   :precision => 20, :scale => 0
    t.decimal  "column_width_percentage",               :precision => 20, :scale => 0
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "portal_page_column", ["created_tx_stamp"], :name => "prtl_pg_cln_txcrts"
  add_index "portal_page_column", ["last_updated_tx_stamp"], :name => "prtl_pg_cln_txstmp"
  add_index "portal_page_column", ["portal_page_id"], :name => "prtl_pgcol_page"

  create_table "portal_page_portlet", :id => false, :force => true do |t|
    t.string   "portal_page_id",        :limit => 20,                                :null => false
    t.string   "portal_portlet_id",     :limit => 20,                                :null => false
    t.string   "portlet_seq_id",        :limit => 20,                                :null => false
    t.string   "column_seq_id",         :limit => 20
    t.decimal  "sequence_num",                        :precision => 20, :scale => 0
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "portal_page_portlet", ["created_tx_stamp"], :name => "prl_pg_prtt_txcrts"
  add_index "portal_page_portlet", ["last_updated_tx_stamp"], :name => "prl_pg_prtt_txstmp"
  add_index "portal_page_portlet", ["portal_page_id"], :name => "prtl_pgptlt_page"
  add_index "portal_page_portlet", ["portal_portlet_id"], :name => "prtl_pgptlt_ptlt"

  create_table "portal_portlet", :id => false, :force => true do |t|
    t.string   "portal_portlet_id",     :limit => 20,  :null => false
    t.string   "portlet_name",          :limit => 100
    t.string   "screen_name"
    t.string   "screen_location"
    t.string   "edit_form_name"
    t.string   "edit_form_location"
    t.string   "description"
    t.string   "screenshot"
    t.string   "security_service_name"
    t.string   "security_main_action",  :limit => 60
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "portal_portlet", ["created_tx_stamp"], :name => "prtl_prtlt_txcrts"
  add_index "portal_portlet", ["last_updated_tx_stamp"], :name => "prtl_prtlt_txstmp"

  create_table "portlet_attribute", :id => false, :force => true do |t|
    t.string   "portal_page_id",        :limit => 20, :null => false
    t.string   "portal_portlet_id",     :limit => 20, :null => false
    t.string   "portlet_seq_id",        :limit => 20, :null => false
    t.string   "attr_name",             :limit => 60, :null => false
    t.string   "attr_value"
    t.string   "attr_type"
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "portlet_attribute", ["created_tx_stamp"], :name => "prtlt_attrt_txcrts"
  add_index "portlet_attribute", ["last_updated_tx_stamp"], :name => "prtlt_attrt_txstmp"
  add_index "portlet_attribute", ["portal_portlet_id"], :name => "ptlt_attr_ptlt"

  create_table "portlet_category", :id => false, :force => true do |t|
    t.string   "portlet_category_id",   :limit => 20, :null => false
    t.string   "description"
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "portlet_category", ["created_tx_stamp"], :name => "prtlt_ctgr_txcrts"
  add_index "portlet_category", ["last_updated_tx_stamp"], :name => "prtlt_ctgr_txstmp"

  create_table "portlet_portlet_category", :id => false, :force => true do |t|
    t.string   "portal_portlet_id",     :limit => 20, :null => false
    t.string   "portlet_category_id",   :limit => 20, :null => false
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "portlet_portlet_category", ["created_tx_stamp"], :name => "prtt_prt_ctr_txcrs"
  add_index "portlet_portlet_category", ["last_updated_tx_stamp"], :name => "prtt_prt_ctr_txstp"
  add_index "portlet_portlet_category", ["portal_portlet_id"], :name => "pptltcat_ptpl"
  add_index "portlet_portlet_category", ["portlet_category_id"], :name => "pptltcat_ptltcat"

  create_table "protected_view", :id => false, :force => true do |t|
    t.string   "group_id",              :limit => 20,                                :null => false
    t.string   "view_name_id",          :limit => 60,                                :null => false
    t.decimal  "max_hits",                            :precision => 20, :scale => 0
    t.decimal  "max_hits_duration",                   :precision => 20, :scale => 0
    t.decimal  "tarpit_duration",                     :precision => 20, :scale => 0
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "protected_view", ["created_tx_stamp"], :name => "prtctd_vw_txcrts"
  add_index "protected_view", ["group_id"], :name => "view_secgrp_grp"
  add_index "protected_view", ["last_updated_tx_stamp"], :name => "prtctd_vw_txstmp"

  create_table "protocol_type", :id => false, :force => true do |t|
    t.string   "protocol_type_id",      :limit => 20,  :null => false
    t.string   "protocol_name",         :limit => 100
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "protocol_type", ["created_tx_stamp"], :name => "prtcl_tp_txcrts"
  add_index "protocol_type", ["last_updated_tx_stamp"], :name => "prtcl_tp_txstmp"

  create_table "recurrence_info", :id => false, :force => true do |t|
    t.string   "recurrence_info_id",    :limit => 20,                                :null => false
    t.datetime "start_date_time"
    t.text     "exception_date_times"
    t.text     "recurrence_date_times"
    t.string   "exception_rule_id",     :limit => 20
    t.string   "recurrence_rule_id",    :limit => 20
    t.decimal  "recurrence_count",                    :precision => 20, :scale => 0
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "recurrence_info", ["created_tx_stamp"], :name => "rcrrnc_inf_txcrts"
  add_index "recurrence_info", ["exception_rule_id"], :name => "rec_info_ex_rcrle"
  add_index "recurrence_info", ["last_updated_tx_stamp"], :name => "rcrrnc_inf_txstmp"
  add_index "recurrence_info", ["recurrence_rule_id"], :name => "rec_info_rcrle"

  create_table "recurrence_rule", :id => false, :force => true do |t|
    t.string   "recurrence_rule_id",    :limit => 20,                                :null => false
    t.string   "frequency",             :limit => 60
    t.datetime "until_date_time"
    t.decimal  "count_number",                        :precision => 20, :scale => 0
    t.decimal  "interval_number",                     :precision => 20, :scale => 0
    t.text     "by_second_list"
    t.text     "by_minute_list"
    t.text     "by_hour_list"
    t.text     "by_day_list"
    t.text     "by_month_day_list"
    t.text     "by_year_day_list"
    t.text     "by_week_no_list"
    t.text     "by_month_list"
    t.text     "by_set_pos_list"
    t.string   "week_start",            :limit => 60
    t.text     "x_name"
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "recurrence_rule", ["created_tx_stamp"], :name => "rcrrnc_rl_txcrts"
  add_index "recurrence_rule", ["last_updated_tx_stamp"], :name => "rcrrnc_rl_txstmp"

  create_table "runtime_data", :id => false, :force => true do |t|
    t.string   "runtime_data_id",       :limit => 20, :null => false
    t.text     "runtime_info"
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "runtime_data", ["created_tx_stamp"], :name => "rntm_dt_txcrts"
  add_index "runtime_data", ["last_updated_tx_stamp"], :name => "rntm_dt_txstmp"

  create_table "security_group", :id => false, :force => true do |t|
    t.string   "group_id",              :limit => 20, :null => false
    t.string   "description"
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "security_group", ["created_tx_stamp"], :name => "scrt_grp_txcrts"
  add_index "security_group", ["last_updated_tx_stamp"], :name => "scrt_grp_txstmp"

  create_table "security_group_permission", :id => false, :force => true do |t|
    t.string   "group_id",              :limit => 20, :null => false
    t.string   "permission_id",         :limit => 60, :null => false
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "security_group_permission", ["created_tx_stamp"], :name => "sct_grp_prmn_txcrs"
  add_index "security_group_permission", ["group_id"], :name => "sec_grp_perm_grp"
  add_index "security_group_permission", ["last_updated_tx_stamp"], :name => "sct_grp_prmn_txstp"

  create_table "security_permission", :id => false, :force => true do |t|
    t.string   "permission_id",         :limit => 60, :null => false
    t.string   "description"
    t.string   "dynamic_access"
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "security_permission", ["created_tx_stamp"], :name => "scrt_prmssn_txcrts"
  add_index "security_permission", ["last_updated_tx_stamp"], :name => "scrt_prmssn_txstmp"

  create_table "security_permission_auto_grant", :id => false, :force => true do |t|
    t.string   "permission_id",         :limit => 60, :null => false
    t.string   "grant_permission",                    :null => false
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "security_permission_auto_grant", ["created_tx_stamp"], :name => "sct_prn_at_grt_txs"
  add_index "security_permission_auto_grant", ["last_updated_tx_stamp"], :name => "sct_prn_at_grt_txp"
  add_index "security_permission_auto_grant", ["permission_id"], :name => "sec_perm_auto_grnt"

  create_table "selenium_test_suite_path", :id => false, :force => true do |t|
    t.string   "test_suite_id",         :limit => 20,  :null => false
    t.string   "test_suite_name",       :limit => 100
    t.string   "test_suite_path"
    t.text     "description"
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "selenium_test_suite_path", ["created_tx_stamp"], :name => "slm_tst_st_pth_txs"
  add_index "selenium_test_suite_path", ["last_updated_tx_stamp"], :name => "slm_tst_st_pth_txp"

  create_table "sequence_value_item", :id => false, :force => true do |t|
    t.string   "seq_name",              :limit => 60,                                :null => false
    t.decimal  "seq_id",                              :precision => 20, :scale => 0
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "sequence_value_item", ["created_tx_stamp"], :name => "sqnc_vl_itm_txcrts"
  add_index "sequence_value_item", ["last_updated_tx_stamp"], :name => "sqnc_vl_itm_txstmp"

  create_table "server_hit", :id => false, :force => true do |t|
    t.string   "visit_id",              :limit => 20,                                :null => false
    t.string   "content_id",                                                         :null => false
    t.datetime "hit_start_date_time",                                                :null => false
    t.string   "hit_type_id",           :limit => 20,                                :null => false
    t.decimal  "num_of_bytes",                        :precision => 20, :scale => 0
    t.decimal  "running_time_millis",                 :precision => 20, :scale => 0
    t.string   "user_login_id"
    t.string   "status_id",             :limit => 20
    t.string   "request_url"
    t.string   "referrer_url"
    t.string   "server_ip_address",     :limit => 20
    t.string   "server_host_name"
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "server_hit", ["created_tx_stamp"], :name => "server_hit_txcrts"
  add_index "server_hit", ["hit_type_id"], :name => "server_hit_shtyp"
  add_index "server_hit", ["last_updated_tx_stamp"], :name => "server_hit_txstmp"
  add_index "server_hit", ["status_id"], :name => "server_hit_status"
  add_index "server_hit", ["user_login_id"], :name => "server_hit_user"
  add_index "server_hit", ["visit_id"], :name => "server_hit_visit"

  create_table "server_hit_bin", :id => false, :force => true do |t|
    t.string   "server_hit_bin_id",     :limit => 20,                                :null => false
    t.string   "content_id"
    t.string   "hit_type_id",           :limit => 20
    t.string   "server_ip_address",     :limit => 20
    t.string   "server_host_name"
    t.datetime "bin_start_date_time"
    t.datetime "bin_end_date_time"
    t.decimal  "number_hits",                         :precision => 20, :scale => 0
    t.decimal  "total_time_millis",                   :precision => 20, :scale => 0
    t.decimal  "min_time_millis",                     :precision => 20, :scale => 0
    t.decimal  "max_time_millis",                     :precision => 20, :scale => 0
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "server_hit_bin", ["created_tx_stamp"], :name => "srvr_ht_bn_txcrts"
  add_index "server_hit_bin", ["hit_type_id"], :name => "server_hbin_type"
  add_index "server_hit_bin", ["last_updated_tx_stamp"], :name => "srvr_ht_bn_txstmp"

  create_table "server_hit_type", :id => false, :force => true do |t|
    t.string   "hit_type_id",           :limit => 20, :null => false
    t.string   "description"
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "server_hit_type", ["created_tx_stamp"], :name => "srvr_ht_tp_txcrts"
  add_index "server_hit_type", ["last_updated_tx_stamp"], :name => "srvr_ht_tp_txstmp"

  create_table "service_semaphore", :id => false, :force => true do |t|
    t.string   "service_name",          :limit => 100, :null => false
    t.string   "lock_thread",           :limit => 100
    t.datetime "lock_time"
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "service_semaphore", ["created_tx_stamp"], :name => "srvc_smphr_txcrts"
  add_index "service_semaphore", ["last_updated_tx_stamp"], :name => "srvc_smphr_txstmp"

  create_table "standard_language", :id => false, :force => true do |t|
    t.string   "standard_language_id",  :limit => 20, :null => false
    t.string   "lang_code3t",           :limit => 10
    t.string   "lang_code3b",           :limit => 10
    t.string   "lang_code2",            :limit => 10
    t.string   "lang_name",             :limit => 60
    t.string   "lang_family",           :limit => 60
    t.string   "lang_charset",          :limit => 60
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "standard_language", ["created_tx_stamp"], :name => "stndrd_lngg_txcrts"
  add_index "standard_language", ["last_updated_tx_stamp"], :name => "stndrd_lngg_txstmp"

  create_table "standard_time_period", :id => false, :force => true do |t|
    t.string   "standard_time_period_id", :limit => 20, :null => false
    t.string   "period_type_id",          :limit => 20
    t.datetime "from_date"
    t.datetime "thru_date"
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "standard_time_period", ["created_tx_stamp"], :name => "stndd_tm_prd_txcrs"
  add_index "standard_time_period", ["last_updated_tx_stamp"], :name => "stndd_tm_prd_txstp"
  add_index "standard_time_period", ["period_type_id"], :name => "std_tm_per_type"

  create_table "status_item", :id => false, :force => true do |t|
    t.string   "status_id",             :limit => 20, :null => false
    t.string   "status_type_id",        :limit => 20
    t.string   "status_code",           :limit => 60
    t.string   "sequence_id",           :limit => 20
    t.string   "description"
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "status_item", ["created_tx_stamp"], :name => "status_item_txcrts"
  add_index "status_item", ["last_updated_tx_stamp"], :name => "status_item_txstmp"
  add_index "status_item", ["status_type_id"], :name => "status_to_type"

  create_table "status_type", :id => false, :force => true do |t|
    t.string   "status_type_id",        :limit => 20, :null => false
    t.string   "parent_type_id",        :limit => 20
    t.string   "has_table",             :limit => 1
    t.string   "description"
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "status_type", ["created_tx_stamp"], :name => "status_type_txcrts"
  add_index "status_type", ["last_updated_tx_stamp"], :name => "status_type_txstmp"
  add_index "status_type", ["parent_type_id"], :name => "status_type_parent"

  create_table "status_valid_change", :id => false, :force => true do |t|
    t.string   "status_id",             :limit => 20,  :null => false
    t.string   "status_id_to",          :limit => 20,  :null => false
    t.string   "condition_expression"
    t.string   "transition_name",       :limit => 100
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "status_valid_change", ["created_tx_stamp"], :name => "sts_vld_chg_txcrts"
  add_index "status_valid_change", ["last_updated_tx_stamp"], :name => "sts_vld_chg_txstmp"
  add_index "status_valid_change", ["status_id"], :name => "status_chg_main"
  add_index "status_valid_change", ["status_id_to"], :name => "status_chg_to"

  create_table "tarpitted_login_view", :id => false, :force => true do |t|
    t.string   "view_name_id",             :limit => 60,                                :null => false
    t.string   "user_login_id",            :limit => 20,                                :null => false
    t.decimal  "tarpit_release_date_time",               :precision => 20, :scale => 0
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "tarpitted_login_view", ["created_tx_stamp"], :name => "trptd_lgn_vw_txcrs"
  add_index "tarpitted_login_view", ["last_updated_tx_stamp"], :name => "trptd_lgn_vw_txstp"

  create_table "temporal_expression", :id => false, :force => true do |t|
    t.string   "temp_expr_id",          :limit => 20,                                :null => false
    t.string   "temp_expr_type_id",     :limit => 20
    t.string   "description"
    t.datetime "date1"
    t.datetime "date2"
    t.decimal  "integer1",                            :precision => 20, :scale => 0
    t.decimal  "integer2",                            :precision => 20, :scale => 0
    t.string   "string1",               :limit => 20
    t.string   "string2",               :limit => 20
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "temporal_expression", ["created_tx_stamp"], :name => "tmpl_exprsn_txcrts"
  add_index "temporal_expression", ["last_updated_tx_stamp"], :name => "tmpl_exprsn_txstmp"

  create_table "temporal_expression_assoc", :id => false, :force => true do |t|
    t.string   "from_temp_expr_id",     :limit => 20, :null => false
    t.string   "to_temp_expr_id",       :limit => 20, :null => false
    t.string   "expr_assoc_type",       :limit => 20
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "temporal_expression_assoc", ["created_tx_stamp"], :name => "tml_exprn_asc_txcs"
  add_index "temporal_expression_assoc", ["from_temp_expr_id"], :name => "temp_expr_from"
  add_index "temporal_expression_assoc", ["last_updated_tx_stamp"], :name => "tml_exprn_asc_txsp"
  add_index "temporal_expression_assoc", ["to_temp_expr_id"], :name => "temp_expr_to"

  create_table "tenant", :id => false, :force => true do |t|
    t.string   "tenant_id",             :limit => 20,  :null => false
    t.string   "tenant_name",           :limit => 100
    t.string   "disabled",              :limit => 1
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "tenant", ["created_tx_stamp"], :name => "tenant_txcrts"
  add_index "tenant", ["last_updated_tx_stamp"], :name => "tenant_txstmp"

  create_table "tenant_data_source", :id => false, :force => true do |t|
    t.string   "tenant_id",             :limit => 20,  :null => false
    t.string   "entity_group_name",     :limit => 100, :null => false
    t.string   "jdbc_uri"
    t.string   "jdbc_username"
    t.string   "jdbc_password"
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "tenant_data_source", ["created_tx_stamp"], :name => "tnnt_dt_src_txcrts"
  add_index "tenant_data_source", ["last_updated_tx_stamp"], :name => "tnnt_dt_src_txstmp"
  add_index "tenant_data_source", ["tenant_id"], :name => "tntdtsrc_tnt"

  create_table "test_blob", :id => false, :force => true do |t|
    t.string   "test_blob_id",          :limit => 20, :null => false
    t.binary   "test_blob_field"
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "test_blob", ["created_tx_stamp"], :name => "test_blob_txcrts"
  add_index "test_blob", ["last_updated_tx_stamp"], :name => "test_blob_txstmp"

  create_table "test_field_type", :id => false, :force => true do |t|
    t.string   "test_field_type_id",    :limit => 20,                                :null => false
    t.binary   "blob_field"
    t.date     "date_field"
    t.time     "time_field"
    t.datetime "date_time_field"
    t.decimal  "fixed_point_field",                   :precision => 18, :scale => 6
    t.float    "floating_point_field"
    t.decimal  "numeric_field",                       :precision => 20, :scale => 0
    t.text     "clob_field"
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "test_field_type", ["created_tx_stamp"], :name => "tst_fld_tp_txcrts"
  add_index "test_field_type", ["last_updated_tx_stamp"], :name => "tst_fld_tp_txstmp"

  create_table "testing", :id => false, :force => true do |t|
    t.string   "testing_id",            :limit => 20,                                 :null => false
    t.string   "testing_type_id",       :limit => 20
    t.string   "testing_name",          :limit => 100
    t.string   "description"
    t.string   "comments"
    t.decimal  "testing_size",                         :precision => 20, :scale => 0
    t.datetime "testing_date"
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "testing", ["created_tx_stamp"], :name => "testing_txcrts"
  add_index "testing", ["last_updated_tx_stamp"], :name => "testing_txstmp"
  add_index "testing", ["testing_type_id"], :name => "entity_enty_typ"

  create_table "testing_node", :id => false, :force => true do |t|
    t.string   "testing_node_id",        :limit => 20, :null => false
    t.string   "primary_parent_node_id", :limit => 20
    t.string   "description"
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "testing_node", ["created_tx_stamp"], :name => "tstng_nd_txcrts"
  add_index "testing_node", ["last_updated_tx_stamp"], :name => "tstng_nd_txstmp"
  add_index "testing_node", ["primary_parent_node_id"], :name => "testng_nde_parnt"

  create_table "testing_node_member", :id => false, :force => true do |t|
    t.string   "testing_node_id",       :limit => 20, :null => false
    t.string   "testing_id",            :limit => 20, :null => false
    t.datetime "from_date",                           :null => false
    t.datetime "thru_date"
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "testing_node_member", ["created_tx_stamp"], :name => "tstg_nd_mmr_txcrts"
  add_index "testing_node_member", ["last_updated_tx_stamp"], :name => "tstg_nd_mmr_txstmp"
  add_index "testing_node_member", ["testing_id"], :name => "testing_nmbr_test"
  add_index "testing_node_member", ["testing_node_id"], :name => "test_nmbr_node"

  create_table "testing_type", :id => false, :force => true do |t|
    t.string   "testing_type_id",       :limit => 20, :null => false
    t.string   "description"
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "testing_type", ["created_tx_stamp"], :name => "tstng_tp_txcrts"
  add_index "testing_type", ["last_updated_tx_stamp"], :name => "tstng_tp_txstmp"

  create_table "uom", :id => false, :force => true do |t|
    t.string   "uom_id",                :limit => 20, :null => false
    t.string   "uom_type_id",           :limit => 20
    t.string   "abbreviation",          :limit => 60
    t.string   "description"
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "uom", ["created_tx_stamp"], :name => "uom_txcrts"
  add_index "uom", ["last_updated_tx_stamp"], :name => "uom_txstmp"
  add_index "uom", ["uom_type_id"], :name => "uom_to_type"

  create_table "uom_conversion", :id => false, :force => true do |t|
    t.string   "uom_id",                :limit => 20,                                :null => false
    t.string   "uom_id_to",             :limit => 20,                                :null => false
    t.float    "conversion_factor"
    t.string   "custom_method_id",      :limit => 20
    t.decimal  "decimal_scale",                       :precision => 20, :scale => 0
    t.string   "rounding_mode",         :limit => 20
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "uom_conversion", ["created_tx_stamp"], :name => "um_cnvrsn_txcrts"
  add_index "uom_conversion", ["custom_method_id"], :name => "uom_custom_method"
  add_index "uom_conversion", ["last_updated_tx_stamp"], :name => "um_cnvrsn_txstmp"
  add_index "uom_conversion", ["uom_id"], :name => "uom_conv_main"
  add_index "uom_conversion", ["uom_id_to"], :name => "uom_conv_to"

  create_table "uom_conversion_dated", :id => false, :force => true do |t|
    t.string   "uom_id",                :limit => 20,                                :null => false
    t.string   "uom_id_to",             :limit => 20,                                :null => false
    t.datetime "from_date",                                                          :null => false
    t.datetime "thru_date"
    t.float    "conversion_factor"
    t.string   "custom_method_id",      :limit => 20
    t.decimal  "decimal_scale",                       :precision => 20, :scale => 0
    t.string   "rounding_mode",         :limit => 20
    t.string   "purpose_enum_id",       :limit => 20
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "uom_conversion_dated", ["created_tx_stamp"], :name => "um_cnvrn_dtd_txcrs"
  add_index "uom_conversion_dated", ["custom_method_id"], :name => "uomd_custom_method"
  add_index "uom_conversion_dated", ["last_updated_tx_stamp"], :name => "um_cnvrn_dtd_txstp"
  add_index "uom_conversion_dated", ["purpose_enum_id"], :name => "uomd_purpose_enum"
  add_index "uom_conversion_dated", ["uom_id"], :name => "date_uom_conv_main"
  add_index "uom_conversion_dated", ["uom_id_to"], :name => "date_uom_conv_to"

  create_table "uom_group", :id => false, :force => true do |t|
    t.string   "uom_group_id",          :limit => 20, :null => false
    t.string   "uom_id",                :limit => 20, :null => false
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "uom_group", ["created_tx_stamp"], :name => "uom_group_txcrts"
  add_index "uom_group", ["last_updated_tx_stamp"], :name => "uom_group_txstmp"
  add_index "uom_group", ["uom_id"], :name => "uom_group_uom"

  create_table "uom_type", :id => false, :force => true do |t|
    t.string   "uom_type_id",           :limit => 20, :null => false
    t.string   "parent_type_id",        :limit => 20
    t.string   "has_table",             :limit => 1
    t.string   "description"
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "uom_type", ["created_tx_stamp"], :name => "uom_type_txcrts"
  add_index "uom_type", ["last_updated_tx_stamp"], :name => "uom_type_txstmp"
  add_index "uom_type", ["parent_type_id"], :name => "uom_type_parent"

  create_table "user_agent", :id => false, :force => true do |t|
    t.string   "user_agent_id",             :limit => 20, :null => false
    t.string   "browser_type_id",           :limit => 20
    t.string   "platform_type_id",          :limit => 20
    t.string   "protocol_type_id",          :limit => 20
    t.string   "user_agent_type_id",        :limit => 20
    t.string   "user_agent_method_type_id", :limit => 20
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "user_agent", ["browser_type_id"], :name => "uagent_browser"
  add_index "user_agent", ["created_tx_stamp"], :name => "user_agent_txcrts"
  add_index "user_agent", ["last_updated_tx_stamp"], :name => "user_agent_txstmp"
  add_index "user_agent", ["platform_type_id"], :name => "uagent_platform"
  add_index "user_agent", ["protocol_type_id"], :name => "uagent_protocol"
  add_index "user_agent", ["user_agent_method_type_id"], :name => "uagent_method"
  add_index "user_agent", ["user_agent_type_id"], :name => "uagent_type"

  create_table "user_agent_method_type", :id => false, :force => true do |t|
    t.string   "user_agent_method_type_id", :limit => 20, :null => false
    t.string   "description"
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "user_agent_method_type", ["created_tx_stamp"], :name => "usr_agt_mtd_tp_txs"
  add_index "user_agent_method_type", ["last_updated_tx_stamp"], :name => "usr_agt_mtd_tp_txp"

  create_table "user_agent_type", :id => false, :force => true do |t|
    t.string   "user_agent_type_id",    :limit => 20, :null => false
    t.string   "description"
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "user_agent_type", ["created_tx_stamp"], :name => "usr_agnt_tp_txcrts"
  add_index "user_agent_type", ["last_updated_tx_stamp"], :name => "usr_agnt_tp_txstmp"

  create_table "user_login", :id => false, :force => true do |t|
    t.string   "user_login_id",                                                         :null => false
    t.string   "current_password",         :limit => 60
    t.string   "password_hint"
    t.string   "is_system",                :limit => 1
    t.string   "enabled",                  :limit => 1
    t.string   "has_logged_out",           :limit => 1
    t.string   "require_password_change",  :limit => 1
    t.string   "last_currency_uom",        :limit => 20
    t.string   "last_locale",              :limit => 10
    t.string   "last_time_zone",           :limit => 60
    t.datetime "disabled_date_time"
    t.decimal  "successive_failed_logins",               :precision => 20, :scale => 0
    t.string   "external_auth_id"
    t.string   "user_ldap_dn"
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "user_login", ["created_tx_stamp"], :name => "user_login_txcrts"
  add_index "user_login", ["last_updated_tx_stamp"], :name => "user_login_txstmp"

  create_table "user_login_flag", :id => false, :force => true do |t|
    t.string   "user_login_id",                        :null => false
    t.string   "client_ip",             :limit => 100, :null => false
    t.string   "user_agent",            :limit => 100, :null => false
    t.string   "has_logged_out",        :limit => 1
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "user_login_flag", ["created_tx_stamp"], :name => "usr_lgn_flg_txcrts"
  add_index "user_login_flag", ["last_updated_tx_stamp"], :name => "usr_lgn_flg_txstmp"

  create_table "user_login_history", :id => false, :force => true do |t|
    t.string   "user_login_id",                       :null => false
    t.string   "visit_id",              :limit => 20
    t.datetime "from_date",                           :null => false
    t.datetime "thru_date"
    t.string   "password_used",         :limit => 60
    t.string   "successful_login",      :limit => 1
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "user_login_history", ["created_tx_stamp"], :name => "usr_lgn_hsr_txcrts"
  add_index "user_login_history", ["last_updated_tx_stamp"], :name => "usr_lgn_hsr_txstmp"
  add_index "user_login_history", ["user_login_id"], :name => "user_lh_user"

  create_table "user_login_password_history", :id => false, :force => true do |t|
    t.string   "user_login_id",                       :null => false
    t.datetime "from_date",                           :null => false
    t.datetime "thru_date"
    t.string   "current_password",      :limit => 60
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "user_login_password_history", ["created_tx_stamp"], :name => "usr_lgn_psd_hsr_ts"
  add_index "user_login_password_history", ["last_updated_tx_stamp"], :name => "usr_lgn_psd_hsr_tp"
  add_index "user_login_password_history", ["user_login_id"], :name => "user_lph_user"

  create_table "user_login_security_group", :id => false, :force => true do |t|
    t.string   "user_login_id",                       :null => false
    t.string   "group_id",              :limit => 20, :null => false
    t.datetime "from_date",                           :null => false
    t.datetime "thru_date"
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "user_login_security_group", ["created_tx_stamp"], :name => "usr_lgn_sct_grp_ts"
  add_index "user_login_security_group", ["group_id"], :name => "user_secgrp_grp"
  add_index "user_login_security_group", ["last_updated_tx_stamp"], :name => "usr_lgn_sct_grp_tp"
  add_index "user_login_security_group", ["user_login_id"], :name => "user_secgrp_user"

  create_table "user_login_session", :id => false, :force => true do |t|
    t.string   "user_login_id",         :null => false
    t.datetime "saved_date"
    t.text     "session_data"
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "user_login_session", ["created_tx_stamp"], :name => "usr_lgn_ssn_txcrts"
  add_index "user_login_session", ["last_updated_tx_stamp"], :name => "usr_lgn_ssn_txstmp"
  add_index "user_login_session", ["user_login_id"], :name => "user_session_user"

  create_table "user_pref_group_type", :id => false, :force => true do |t|
    t.string   "user_pref_group_type_id", :limit => 60, :null => false
    t.string   "description"
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "user_pref_group_type", ["created_tx_stamp"], :name => "usr_prf_grp_tp_txs"
  add_index "user_pref_group_type", ["last_updated_tx_stamp"], :name => "usr_prf_grp_tp_txp"

  create_table "user_preference", :id => false, :force => true do |t|
    t.string   "user_login_id",                         :null => false
    t.string   "user_pref_type_id",       :limit => 60, :null => false
    t.string   "user_pref_group_type_id", :limit => 60
    t.string   "user_pref_value"
    t.string   "user_pref_data_type",     :limit => 60
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "user_preference", ["created_tx_stamp"], :name => "usr_prfrnc_txcrts"
  add_index "user_preference", ["last_updated_tx_stamp"], :name => "usr_prfrnc_txstmp"

  create_table "visit", :id => false, :force => true do |t|
    t.string   "visit_id",                    :limit => 20, :null => false
    t.string   "visitor_id",                  :limit => 20
    t.string   "user_login_id"
    t.string   "user_created",                :limit => 1
    t.string   "session_id"
    t.string   "server_ip_address",           :limit => 20
    t.string   "server_host_name"
    t.string   "webapp_name",                 :limit => 60
    t.string   "initial_locale",              :limit => 60
    t.string   "initial_request"
    t.string   "initial_referrer"
    t.string   "initial_user_agent"
    t.string   "user_agent_id",               :limit => 20
    t.string   "client_ip_address",           :limit => 20
    t.string   "client_host_name"
    t.string   "client_user",                 :limit => 60
    t.string   "client_ip_isp_name",          :limit => 60
    t.string   "client_ip_postal_code",       :limit => 60
    t.string   "client_ip_state_prov_geo_id", :limit => 20
    t.string   "client_ip_country_geo_id",    :limit => 20
    t.string   "cookie",                      :limit => 60
    t.datetime "from_date"
    t.datetime "thru_date"
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "visit", ["client_ip_country_geo_id"], :name => "visit_cip_cntry"
  add_index "visit", ["client_ip_state_prov_geo_id"], :name => "visit_cip_stprv"
  add_index "visit", ["created_tx_stamp"], :name => "visit_txcrts"
  add_index "visit", ["last_updated_tx_stamp"], :name => "visit_txstmp"
  add_index "visit", ["thru_date"], :name => "visit_thru_idx"
  add_index "visit", ["user_agent_id"], :name => "visit_user_agnt"
  add_index "visit", ["visitor_id"], :name => "visit_visitor"

  create_table "visitor", :id => false, :force => true do |t|
    t.string   "visitor_id",            :limit => 20, :null => false
    t.string   "user_login_id"
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "visitor", ["created_tx_stamp"], :name => "visitor_txcrts"
  add_index "visitor", ["last_updated_tx_stamp"], :name => "visitor_txstmp"
  add_index "visitor", ["user_login_id"], :name => "visitor_usrlgn"

  create_table "visual_theme", :id => false, :force => true do |t|
    t.string   "visual_theme_id",       :limit => 20, :null => false
    t.string   "visual_theme_set_id",   :limit => 20
    t.string   "description"
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "visual_theme", ["created_tx_stamp"], :name => "vsl_thm_txcrts"
  add_index "visual_theme", ["last_updated_tx_stamp"], :name => "vsl_thm_txstmp"
  add_index "visual_theme", ["visual_theme_set_id"], :name => "vt_theme_set"

  create_table "visual_theme_resource", :id => false, :force => true do |t|
    t.string   "visual_theme_id",       :limit => 20, :null => false
    t.string   "resource_type_enum_id", :limit => 20, :null => false
    t.string   "sequence_id",           :limit => 20, :null => false
    t.string   "resource_value"
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "visual_theme_resource", ["created_tx_stamp"], :name => "vsl_thm_rsc_txcrts"
  add_index "visual_theme_resource", ["last_updated_tx_stamp"], :name => "vsl_thm_rsc_txstmp"
  add_index "visual_theme_resource", ["resource_type_enum_id"], :name => "vt_res_type_enum"
  add_index "visual_theme_resource", ["visual_theme_id"], :name => "vt_res_theme"

  create_table "visual_theme_set", :id => false, :force => true do |t|
    t.string   "visual_theme_set_id",   :limit => 20, :null => false
    t.string   "description"
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "visual_theme_set", ["created_tx_stamp"], :name => "vsl_thm_st_txcrts"
  add_index "visual_theme_set", ["last_updated_tx_stamp"], :name => "vsl_thm_st_txstmp"

  create_table "web_page", :id => false, :force => true do |t|
    t.string   "web_page_id",           :limit => 20,  :null => false
    t.string   "page_name",             :limit => 100
    t.string   "web_site_id",           :limit => 20
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "web_page", ["created_tx_stamp"], :name => "web_page_txcrts"
  add_index "web_page", ["last_updated_tx_stamp"], :name => "web_page_txstmp"
  add_index "web_page", ["web_site_id"], :name => "web_page_site"

  create_table "web_site", :id => false, :force => true do |t|
    t.string   "web_site_id",             :limit => 20,  :null => false
    t.string   "site_name",               :limit => 100
    t.string   "http_host"
    t.string   "http_port",               :limit => 10
    t.string   "https_host"
    t.string   "https_port",              :limit => 10
    t.string   "enable_https",            :limit => 1
    t.string   "standard_content_prefix"
    t.string   "secure_content_prefix"
    t.string   "cookie_domain"
    t.string   "visual_theme_set_id",     :limit => 20
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "web_site", ["created_tx_stamp"], :name => "web_site_txcrts"
  add_index "web_site", ["last_updated_tx_stamp"], :name => "web_site_txstmp"
  add_index "web_site", ["visual_theme_set_id"], :name => "web_site_theme_set"

  create_table "webslinger_host_mapping", :id => false, :force => true do |t|
    t.string   "host_name",             :limit => 100, :null => false
    t.string   "context_path",                         :null => false
    t.string   "webslinger_server_id",  :limit => 20
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "webslinger_host_mapping", ["created_tx_stamp"], :name => "wbslr_hst_mpg_txcs"
  add_index "webslinger_host_mapping", ["last_updated_tx_stamp"], :name => "wbslr_hst_mpg_txsp"
  add_index "webslinger_host_mapping", ["webslinger_server_id"], :name => "whm_ws"

  create_table "webslinger_host_suffix", :id => false, :force => true do |t|
    t.string   "host_suffix_id",        :limit => 20,  :null => false
    t.string   "host_suffix",           :limit => 100
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "webslinger_host_suffix", ["created_tx_stamp"], :name => "wbslr_hst_sfx_txcs"
  add_index "webslinger_host_suffix", ["last_updated_tx_stamp"], :name => "wbslr_hst_sfx_txsp"

  create_table "webslinger_server", :id => false, :force => true do |t|
    t.string   "webslinger_server_id",  :limit => 20,  :null => false
    t.string   "delegator_name",        :limit => 100
    t.string   "dispatcher_name",       :limit => 100
    t.string   "server_name",           :limit => 100
    t.string   "web_site_id",           :limit => 20
    t.string   "target",                :limit => 100
    t.string   "load_at_start",         :limit => 1
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "webslinger_server", ["created_tx_stamp"], :name => "wbslngr_srr_txcrts"
  add_index "webslinger_server", ["last_updated_tx_stamp"], :name => "wbslngr_srr_txstmp"
  add_index "webslinger_server", ["web_site_id"], :name => "wss_ws"

  create_table "webslinger_server_base", :id => false, :force => true do |t|
    t.string   "webslinger_server_id",  :limit => 20,                                 :null => false
    t.string   "base_name",             :limit => 100,                                :null => false
    t.decimal  "seq_num",                              :precision => 20, :scale => 0
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "webslinger_server_base", ["created_tx_stamp"], :name => "wbslr_srr_bs_txcrs"
  add_index "webslinger_server_base", ["last_updated_tx_stamp"], :name => "wbslr_srr_bs_txstp"
  add_index "webslinger_server_base", ["webslinger_server_id"], :name => "wsb_ws"

  create_table "x509_issuer_provision", :id => false, :force => true do |t|
    t.string   "cert_provision_id",     :limit => 20, :null => false
    t.string   "common_name"
    t.string   "organizational_unit"
    t.string   "organization_name"
    t.string   "city_locality"
    t.string   "state_province"
    t.string   "country"
    t.string   "serial_number"
    t.datetime "last_updated_stamp"
    t.datetime "last_updated_tx_stamp"
    t.datetime "created_stamp"
    t.datetime "created_tx_stamp"
  end

  add_index "x509_issuer_provision", ["created_tx_stamp"], :name => "x59_isr_prvn_txcrs"
  add_index "x509_issuer_provision", ["last_updated_tx_stamp"], :name => "x59_isr_prvn_txstp"

end
