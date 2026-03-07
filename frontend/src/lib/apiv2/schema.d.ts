export interface paths {
    "/health": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Health */
        get: operations["health_health_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/register": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Register */
        post: operations["register_auth_register_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/verify-otp": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Verify Otp */
        post: operations["verify_otp_auth_verify_otp_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/resend-otp": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Resend Otp */
        post: operations["resend_otp_auth_resend_otp_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/login": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Login */
        post: operations["login_auth_login_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/mfa/setup": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Setup Totp */
        post: operations["setup_totp_auth_mfa_setup_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/mfa/verify": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Verify Totp Setup */
        post: operations["verify_totp_setup_auth_mfa_verify_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/mfa-verify-totp-login": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Verify Totp Login */
        post: operations["verify_totp_login_auth_mfa_verify_totp_login_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/mfa/disable": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Disable Totp */
        post: operations["disable_totp_auth_mfa_disable_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/forgot-password": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Forgot Password */
        post: operations["forgot_password_auth_forgot_password_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/reset-password": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Reset Password */
        post: operations["reset_password_auth_reset_password_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/audit/logs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Audit Logs */
        get: operations["get_audit_logs_audit_logs_get"];
        put?: never;
        /** Create Audit Log */
        post: operations["create_audit_log_audit_logs_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/audit/logs/{audit_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Audit Log */
        get: operations["get_audit_log_audit_logs__audit_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/audit/stats": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Audit Stats */
        get: operations["get_audit_stats_audit_stats_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/users/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Users */
        get: operations["get_users_users__get"];
        put?: never;
        /** Create User */
        post: operations["create_user_users__post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/users/{user_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get User By Id */
        get: operations["get_user_by_id_users__user_id__get"];
        /** Update User */
        put: operations["update_user_users__user_id__put"];
        post?: never;
        /** Delete User */
        delete: operations["delete_user_users__user_id__delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/users/{user_id}/change-password": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Change Password */
        post: operations["change_password_users__user_id__change_password_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/users/profile/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get My Profile */
        get: operations["get_my_profile_users_profile_me_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/users/{user_id}/promote-role": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Promote User Role */
        post: operations["promote_user_role_users__user_id__promote_role_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/device-credentials/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Device Network Credentials
         * @description Get Device Network Credentials of current user (does not show password, but shows if it exists)
         */
        get: operations["get_device_credentials_device_credentials__get"];
        /**
         * Update Device Network Credentials
         * @description Update Device Network Credentials of current user
         */
        put: operations["update_device_credentials_device_credentials__put"];
        /**
         * Create new Device Network Credentials
         * @description Create new Device Network Credentials for current user
         */
        post: operations["create_device_credentials_device_credentials__post"];
        /**
         * Delete Device Network Credentials
         * @description Delete Device Network Credentials of current user
         */
        delete: operations["delete_device_credentials_device_credentials__delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/device-credentials/verify": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Verify Device Network Credentials
         * @description Verify Device Network Credentials for device access
         */
        post: operations["verify_device_credentials_device_credentials_verify_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/local-sites/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Local Sites */
        get: operations["get_local_sites_local_sites__get"];
        put?: never;
        /** Create Local Site */
        post: operations["create_local_site_local_sites__post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/local-sites/{site_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Local Site */
        get: operations["get_local_site_local_sites__site_id__get"];
        /** Update Local Site */
        put: operations["update_local_site_local_sites__site_id__put"];
        post?: never;
        /** Delete Local Site */
        delete: operations["delete_local_site_local_sites__site_id__delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/tags/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Tags */
        get: operations["get_tags_tags__get"];
        put?: never;
        /** Create Tag */
        post: operations["create_tag_tags__post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/tags/{tag_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Tag */
        get: operations["get_tag_tags__tag_id__get"];
        /** Update Tag */
        put: operations["update_tag_tags__tag_id__put"];
        post?: never;
        /** Delete Tag */
        delete: operations["delete_tag_tags__tag_id__delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/tags/{tag_id}/usage": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Tag Usage */
        get: operations["get_tag_usage_tags__tag_id__usage_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/operating-systems/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Operating Systems */
        get: operations["get_operating_systems_operating_systems__get"];
        put?: never;
        /** Create Operating System */
        post: operations["create_operating_system_operating_systems__post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/operating-systems/{os_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Operating System */
        get: operations["get_operating_system_operating_systems__os_id__get"];
        /** Update Operating System */
        put: operations["update_operating_system_operating_systems__os_id__put"];
        post?: never;
        /** Delete Operating System */
        delete: operations["delete_operating_system_operating_systems__os_id__delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/operating-systems/{os_id}/usage": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Operating System Usage */
        get: operations["get_operating_system_usage_operating_systems__os_id__usage_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/operating-systems/{os_id}/upload": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Upload Os File */
        post: operations["upload_os_file_operating_systems__os_id__upload_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/operating-systems/{os_id}/files": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Os Files */
        get: operations["get_os_files_operating_systems__os_id__files_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/operating-systems/{os_id}/files/{file_id}/download": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Download Os File */
        get: operations["download_os_file_operating_systems__os_id__files__file_id__download_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/operating-systems/{os_id}/files/{file_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** Delete Os File */
        delete: operations["delete_os_file_operating_systems__os_id__files__file_id__delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/operating-systems/{os_id}/tags": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Assign Tags To Os */
        post: operations["assign_tags_to_os_operating_systems__os_id__tags_post"];
        /** Remove Tags From Os */
        delete: operations["remove_tags_from_os_operating_systems__os_id__tags_delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/policies/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Policies */
        get: operations["get_policies_policies__get"];
        put?: never;
        /** Create Policy */
        post: operations["create_policy_policies__post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/policies/{policy_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Policy */
        get: operations["get_policy_policies__policy_id__get"];
        /** Update Policy */
        put: operations["update_policy_policies__policy_id__put"];
        post?: never;
        /** Delete Policy */
        delete: operations["delete_policy_policies__policy_id__delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/backups/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Backups */
        get: operations["get_backups_backups__get"];
        put?: never;
        /** Create Backup */
        post: operations["create_backup_backups__post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/backups/{backup_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Backup */
        get: operations["get_backup_backups__backup_id__get"];
        /** Update Backup */
        put: operations["update_backup_backups__backup_id__put"];
        post?: never;
        /** Delete Backup */
        delete: operations["delete_backup_backups__backup_id__delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/configuration-templates/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Templates */
        get: operations["get_templates_configuration_templates__get"];
        put?: never;
        /** Create Template */
        post: operations["create_template_configuration_templates__post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/configuration-templates/{template_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Template */
        get: operations["get_template_configuration_templates__template_id__get"];
        /** Update Template */
        put: operations["update_template_configuration_templates__template_id__put"];
        post?: never;
        /** Delete Template */
        delete: operations["delete_template_configuration_templates__template_id__delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/configuration-templates/{template_id}/upload": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Upload Template Config */
        post: operations["upload_template_config_configuration_templates__template_id__upload_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/device-networks/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Devices */
        get: operations["get_devices_device_networks__get"];
        put?: never;
        /** Create Device */
        post: operations["create_device_device_networks__post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/device-networks/{device_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Device */
        get: operations["get_device_device_networks__device_id__get"];
        /** Update Device */
        put: operations["update_device_device_networks__device_id__put"];
        post?: never;
        /** Delete Device */
        delete: operations["delete_device_device_networks__device_id__delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/device-networks/{device_id}/tags": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Assign Tags To Device */
        post: operations["assign_tags_to_device_device_networks__device_id__tags_post"];
        /** Remove Tags From Device */
        delete: operations["remove_tags_from_device_device_networks__device_id__tags_delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/device-networks/sync-openflow": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Sync Openflow Devices */
        post: operations["sync_openflow_devices_device_networks_sync_openflow_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/interfaces/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Interfaces */
        get: operations["get_interfaces_interfaces__get"];
        put?: never;
        /** Create Interface */
        post: operations["create_interface_interfaces__post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/interfaces/device/{device_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Interfaces By Device */
        get: operations["get_interfaces_by_device_interfaces_device__device_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/interfaces/{interface_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Interface */
        get: operations["get_interface_interfaces__interface_id__get"];
        /** Update Interface */
        put: operations["update_interface_interfaces__interface_id__put"];
        post?: never;
        /** Delete Interface */
        delete: operations["delete_interface_interfaces__interface_id__delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/ipam/subnets": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Subnets
         * @description ดึงรายการ subnets ทั้งหมดจาก phpIPAM
         */
        get: operations["get_subnets_ipam_subnets_get"];
        put?: never;
        /** Create Subnet */
        post: operations["create_subnet_ipam_subnets_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/ipam/subnets/{subnet_id}/addresses": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Subnet Addresses
         * @description ดึงรายการ IP addresses ใน subnet
         */
        get: operations["get_subnet_addresses_ipam_subnets__subnet_id__addresses_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/ipam/devices/{device_id}/assign-ip": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Assign Ip To Device
         * @description Assign IP address ให้กับ device
         */
        post: operations["assign_ip_to_device_ipam_devices__device_id__assign_ip_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/ipam/devices/{device_id}/release-ip": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** Release Device Ip */
        delete: operations["release_device_ip_ipam_devices__device_id__release_ip_delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/ipam/interfaces/{interface_id}/assign-ip": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Assign Ip To Interface */
        post: operations["assign_ip_to_interface_ipam_interfaces__interface_id__assign_ip_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/ipam/interfaces/{interface_id}/release-ip": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** Release Interface Ip */
        delete: operations["release_interface_ip_ipam_interfaces__interface_id__release_ip_delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/ipam/subnets/{subnet_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Subnet Detail */
        get: operations["get_subnet_detail_ipam_subnets__subnet_id__get"];
        put?: never;
        post?: never;
        /** Delete Subnet */
        delete: operations["delete_subnet_ipam_subnets__subnet_id__delete"];
        options?: never;
        head?: never;
        /** Update Subnet */
        patch: operations["update_subnet_ipam_subnets__subnet_id__patch"];
        trace?: never;
    };
    "/ipam/subnets/{subnet_id}/usage": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Subnet Usage */
        get: operations["get_subnet_usage_ipam_subnets__subnet_id__usage_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/ipam/sections": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Sections
         * @description ดึงรายการ sections ทั้งหมด
         */
        get: operations["get_sections_ipam_sections_get"];
        put?: never;
        /** Create Section */
        post: operations["create_section_ipam_sections_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/ipam/sections/{section_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** Delete Section */
        delete: operations["delete_section_ipam_sections__section_id__delete"];
        options?: never;
        head?: never;
        /** Update Section */
        patch: operations["update_section_ipam_sections__section_id__patch"];
        trace?: never;
    };
    "/ipam/sections/{section_id}/subnets": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Section Subnets */
        get: operations["get_section_subnets_ipam_sections__section_id__subnets_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/ipam/addresses": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Create Ip Address
         * @description สร้าง IP address ใหม่
         */
        post: operations["create_ip_address_ipam_addresses_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/ipam/addresses/{address_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Ip Address */
        get: operations["get_ip_address_ipam_addresses__address_id__get"];
        put?: never;
        post?: never;
        /** Delete Ip Address */
        delete: operations["delete_ip_address_ipam_addresses__address_id__delete"];
        options?: never;
        head?: never;
        /** Update Ip Address */
        patch: operations["update_ip_address_ipam_addresses__address_id__patch"];
        trace?: never;
    };
    "/ipam/addresses/search": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Search Ip Addresses */
        get: operations["search_ip_addresses_ipam_addresses_search_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/ipam/subnets/{subnet_id}/children": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Subnet Children */
        get: operations["get_subnet_children_ipam_subnets__subnet_id__children_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/nbi/intents": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List Supported Intents
         * @description Get all supported intents grouped by OS
         *
         *     **Always returns 200**
         */
        get: operations["list_supported_intents_api_v1_nbi_intents_get"];
        put?: never;
        /**
         * Handle Intent
         * @description Execute an Intent-based network operation
         *
         *     **Error Codes:**
         *     - `INTENT_NOT_FOUND`: Intent ไม่มีในระบบ
         *     - `DEVICE_NOT_FOUND`: ไม่พบ device
         *     - `DEVICE_NOT_CONNECTED`: Device ยังไม่ connected
         *     - `INVALID_PARAMS`: Parameters ไม่ถูกต้อง
         *     - `ODL_REQUEST_FAILED`: ODL request failed
         *
         *     **Example Request:**
         *     ```json
         *     {
         *         "intent": "show.interface",
         *         "node_id": "CSR1000vT",
         *         "params": {
         *             "interface": "GigabitEthernet1"
         *         }
         *     }
         *     ```
         */
        post: operations["handle_intent_api_v1_nbi_intents_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/nbi/intents/{intent_name}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Intent Info
         * @description Get detailed information about a specific intent
         *
         *     **Error Codes:**
         *     - `INTENT_NOT_FOUND`: Intent ไม่มีในระบบ
         */
        get: operations["get_intent_info_api_v1_nbi_intents__intent_name__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/nbi/devices": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List Devices
         * @description Get all registered devices from Database
         *
         *     **Query Parameters:**
         *     - `mounted_only`: แสดงเฉพาะ devices ที่ mount ใน ODL
         *     - `vendor`: Filter by vendor (cisco, huawei, juniper, arista)
         *
         *     **Error Codes:**
         *     - `DATABASE_ERROR`: Database query failed
         */
        get: operations["list_devices_api_v1_nbi_devices_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/nbi/devices/{device_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Device Info
         * @description Get detailed information about a specific device
         *
         *     **device_id สามารถเป็น:**
         *     - node_id (ODL node name)
         *     - device_name
         *     - database UUID
         *
         *     **Error Codes:**
         *     - `DEVICE_NOT_FOUND`: ไม่พบ device
         *     - `INVALID_DEVICE_ID`: device_id format ไม่ถูกต้อง
         */
        get: operations["get_device_info_api_v1_nbi_devices__device_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/nbi/devices/{device_id}/capabilities": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Device Capabilities
         * @description Get intent capabilities for a specific device
         *
         *     Get intent capabilities for a specific device.
         *
         *     (Note: OpenConfig support has been removed. All intents are now vendor-specific)
         *
         *     **Error Codes:**
         *     - `DEVICE_NOT_FOUND`: ไม่พบ device
         */
        get: operations["get_device_capabilities_api_v1_nbi_devices__device_id__capabilities_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/nbi/odl/nodes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Odl Mounted Nodes
         * @description ดึงรายการ nodes ที่ mount อยู่ใน ODL โดยตรง (real-time)
         *
         *     **Error Codes:**
         *     - `ODL_CONNECTION_FAILED`: ไม่สามารถเชื่อมต่อ ODL ได้
         *     - `ODL_TIMEOUT`: ODL timeout
         */
        get: operations["get_odl_mounted_nodes_api_v1_nbi_odl_nodes_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/nbi/odl/sync": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Sync Devices From Odl
         * @description Sync ข้อมูล Device จาก ODL มา update ใน Database
         *
         *     **Error Codes:**
         *     - `ODL_CONNECTION_FAILED`: ไม่สามารถเชื่อมต่อ ODL ได้
         *     - `DATABASE_ERROR`: Database update failed
         */
        post: operations["sync_devices_from_odl_api_v1_nbi_odl_sync_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/nbi/odl/config": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Odl Config
         * @description ดึงค่า Config ของ ODL จากระบบ (ดึงจาก Cache/DB)
         */
        get: operations["get_odl_config_api_v1_nbi_odl_config_get"];
        /**
         * Update Odl Config
         * @description บันทึกค่า ODL Config ใหม่ลง Database และอัปเดต Cache
         */
        put: operations["update_odl_config_api_v1_nbi_odl_config_put"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/nbi/devices/{node_id}/mount": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Mount Device
         * @description 🔌 Mount device ใน ODL
         *
         *     ใช้ข้อมูล NETCONF credentials จาก Database เพื่อ mount ใน ODL
         *
         *     **Error Codes:**
         *     - `DEVICE_NOT_FOUND`: ไม่พบ device ใน Database
         *     - `MISSING_NODE_ID`: Device ไม่มี node_id
         *     - `MISSING_NETCONF_HOST`: Device ไม่มี netconf_host หรือ ip_address
         *     - `MISSING_NETCONF_CREDENTIALS`: ไม่มี username/password
         *     - `DEVICE_ALREADY_MOUNTED`: Device mount อยู่แล้ว
         *     - `ODL_MOUNT_FAILED`: Mount failed
         *     - `MOUNT_TIMEOUT`: รอ connection timeout
         */
        post: operations["mount_device_api_v1_nbi_devices__node_id__mount_post"];
        /**
         * Unmount Device
         * @description 🔌 Unmount device จาก ODL
         *
         *     **Error Codes:**
         *     - `DEVICE_NOT_FOUND`: ไม่พบ device
         *     - `DEVICE_NOT_MOUNTED`: Device ไม่ได้ mount อยู่
         *     - `ODL_UNMOUNT_FAILED`: Unmount failed
         */
        delete: operations["unmount_device_api_v1_nbi_devices__node_id__mount_delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/nbi/devices/{node_id}/status": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Check Device Status
         * @description 📊 Check connection status และ sync กับ Database
         *
         *     **Error Codes:**
         *     - `DEVICE_NOT_FOUND`: ไม่พบ device
         *     - `DEVICE_NOT_CONNECTED`: Device ยัง connecting หรือ unable to connect
         *     - `ODL_CONNECTION_FAILED`: ไม่สามารถตรวจสอบ status ได้
         */
        get: operations["check_device_status_api_v1_nbi_devices__node_id__status_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/nbi/health": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Nbi Health Check
         * @description NBI Health Check - ตรวจสอบการเชื่อมต่อ ODL และ Database
         *
         *     **Returns:**
         *     - `odl_status`: ODL connection status
         *     - `db_status`: Database connection status
         */
        get: operations["nbi_health_check_api_v1_nbi_health_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/nbi/devices/{node_id}/interfaces/discover": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Discover interfaces from device
         * @description ดึง interface list จาก device ผ่าน ODL ใช้สำหรับ dropdown ให้ user เลือก interface
         */
        get: operations["discover_interfaces_api_v1_nbi_devices__node_id__interfaces_discover_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/nbi/devices/{node_id}/interfaces/names": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get interface name list
         * @description ดึงเฉพาะชื่อ interface สำหรับ dropdown
         */
        get: operations["get_interface_names_api_v1_nbi_devices__node_id__interfaces_names_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/nbi/devices/{node_id}/interfaces/cache": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /**
         * Invalidate interface cache
         * @description ล้าง cache interface list ของ device
         */
        delete: operations["invalidate_cache_api_v1_nbi_devices__node_id__interfaces_cache_delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/nbi/topology/sync": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Trigger Topology Sync
         * @description Trigger a manual synchronization of the Topology from ODL to the Prisma Database.
         *     This fetches nodes, interface ports, and links and upserts them.
         */
        post: operations["trigger_topology_sync_api_v1_nbi_topology_sync_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/nbi/topology": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Hybrid Topology
         * @description ดึงข้อมูล Topology ล่าสุดจาก Database (ที่ Sync ลงมาแล้ว)
         */
        get: operations["get_hybrid_topology_api_v1_nbi_topology_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/debug/odl": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Probe Odl
         * @description เช็คว่า backend ยิงไปหา ODL ได้ไหม (RESTCONF up + auth ok)
         *     RFC-8040 RESTCONF uses /rests/data as base path for data operations
         */
        get: operations["probe_odl_api_v1_debug_odl_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/debug/env": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Debug Env */
        get: operations["debug_env_api_v1_debug_env_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/devices/backups/stats/summary": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Backup Stats Summary
         * @description Get backup statistics. Returns the count of devices based on their LATEST backup status.
         */
        get: operations["get_backup_stats_summary_api_v1_devices_backups_stats_summary_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/devices/backups": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Trigger Bulk Backup
         * @description Trigger an asynchronous backup job for multiple devices.
         *     Returns 202 Accepted immediately with the created Record IDs for tracking.
         */
        post: operations["trigger_bulk_backup_api_v1_devices_backups_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/devices/backups/device/{device_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Device Backup History
         * @description Get the backup history for a specific device.
         *     Does not include the full config_content to keep responses fast.
         */
        get: operations["get_device_backup_history_api_v1_devices_backups_device__device_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/devices/backups/{record_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Backup Record Details
         * @description Get the full details of a specific backup record, INCLUDING the raw configuration content.
         */
        get: operations["get_backup_record_details_api_v1_devices_backups__record_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/devices/backups/diff": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Compare Backup Records
         * @description Compare two configuration backup records and return the unified diff.
         */
        post: operations["compare_backup_records_api_v1_devices_backups_diff_post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/deployments/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Create Deployment
         * @description Triggers an asynchronous configuration deployment to multiple devices based on a Jinja2 template.
         *     Returns 202 Accepted immediately.
         */
        post: operations["create_deployment_deployments__post"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/deployments/{job_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get Deployment Status
         * @description Fetch the status of a bulk deployment job and its associated device records.
         */
        get: operations["get_deployment_status_deployments__job_id__get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        /**
         * AuditAction
         * @enum {string}
         */
        AuditAction: "USER_REGISTER" | "USER_LOGIN" | "USER_LOGOUT" | "USER_CREATE" | "USER_UPDATE" | "USER_DELETE" | "ENABLE_TOTP" | "DISABLE_TOTP" | "REGISTER_PASSKEY" | "REMOVE_PASSKEY" | "PROMOTE_ROLE" | "DEMOTE_ROLE" | "PASSWORD_CHANGE" | "PASSWORD_RESET";
        /** AuditLogCreate */
        AuditLogCreate: {
            /**
             * Actor User Id
             * @description ID ของผู้ที่ทำการกระทำ
             */
            actor_user_id?: string | null;
            /**
             * Target User Id
             * @description ID ของผู้ที่ถูกกระทำ
             */
            target_user_id?: string | null;
            /** @description ประเภทการกระทำ */
            action: components["schemas"]["AuditAction"];
            /**
             * Details
             * @description รายละเอียดเพิ่มเติม
             */
            details?: {
                [key: string]: unknown;
            } | null;
        };
        /** AuditLogListResponse */
        AuditLogListResponse: {
            /** Items */
            items: components["schemas"]["AuditLogResponse"][];
            /** Total */
            total: number;
            /** Limit */
            limit: number;
            /** Offset */
            offset: number;
            /** Has More */
            has_more: boolean;
        };
        /** AuditLogResponse */
        AuditLogResponse: {
            /**
             * Actor User Id
             * @description ID ของผู้ที่ทำการกระทำ
             */
            actor_user_id?: string | null;
            /**
             * Target User Id
             * @description ID ของผู้ที่ถูกกระทำ
             */
            target_user_id?: string | null;
            /** @description ประเภทการกระทำ */
            action: components["schemas"]["AuditAction"];
            /**
             * Details
             * @description รายละเอียดเพิ่มเติม
             */
            details?: {
                [key: string]: unknown;
            } | null;
            /** Id */
            id: string;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
        };
        /** BackupCreate */
        BackupCreate: {
            /**
             * Backup Name
             * @description ชื่อ Backup (ต้องไม่ซ้ำ)
             */
            backup_name: string;
            /**
             * Description
             * @description คำอธิบาย Backup
             */
            description?: string | null;
            /**
             * Policy Id
             * @description Policy ID ที่เชื่อมโยง
             */
            policy_id?: string | null;
            /**
             * Os Id
             * @description Operating System ID ที่เชื่อมโยง
             */
            os_id?: string | null;
            /**
             * @description สถานะของ Backup
             * @default ONLINE
             */
            status: components["schemas"]["BackupStatus"];
            /**
             * Auto Backup
             * @description เปิดใช้งาน Auto Backup
             * @default false
             */
            auto_backup: boolean;
        };
        /** BackupCreateResponse */
        BackupCreateResponse: {
            /** Message */
            message: string;
            backup: components["schemas"]["BackupResponse"];
        };
        /** BackupDeleteResponse */
        BackupDeleteResponse: {
            /** Message */
            message: string;
        };
        /** BackupDiffRequest */
        BackupDiffRequest: {
            /** Record Id 1 */
            record_id_1: string;
            /** Record Id 2 */
            record_id_2: string;
        };
        /** BackupDiffResponse */
        BackupDiffResponse: {
            /** Diff Output */
            diff_output: string;
        };
        /** BackupListResponse */
        BackupListResponse: {
            /**
             * Total
             * @description จำนวนทั้งหมด
             */
            total: number;
            /**
             * Page
             * @description หน้าปัจจุบัน
             */
            page: number;
            /**
             * Page Size
             * @description ขนาดหน้า
             */
            page_size: number;
            /**
             * Backups
             * @description รายการ Backup
             */
            backups: components["schemas"]["BackupResponse"][];
        };
        /** BackupResponse */
        BackupResponse: {
            /**
             * Backup Name
             * @description ชื่อ Backup (ต้องไม่ซ้ำ)
             */
            backup_name: string;
            /**
             * Description
             * @description คำอธิบาย Backup
             */
            description?: string | null;
            /**
             * Policy Id
             * @description Policy ID ที่เชื่อมโยง
             */
            policy_id?: string | null;
            /**
             * Os Id
             * @description Operating System ID ที่เชื่อมโยง
             */
            os_id?: string | null;
            /**
             * @description สถานะของ Backup
             * @default ONLINE
             */
            status: components["schemas"]["BackupStatus"];
            /**
             * Auto Backup
             * @description เปิดใช้งาน Auto Backup
             * @default false
             */
            auto_backup: boolean;
            /**
             * Id
             * @description ID ของ Backup
             */
            id: string;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
            policy?: components["schemas"]["RelatedPolicyInfoBackup"] | null;
            operating_system?: components["schemas"]["RelatedOSInfoBackup"] | null;
            /**
             * Device Count
             * @description จำนวน Device ที่ใช้ Backup นี้
             * @default 0
             */
            device_count: number | null;
        };
        /** BackupStatsResponse */
        BackupStatsResponse: {
            /** Total Devices With Backup */
            total_devices_with_backup: number;
            /** Last Success */
            last_success: number;
            /** Last Failed */
            last_failed: number;
            /** In Progress */
            in_progress: number;
        };
        /**
         * BackupStatus
         * @enum {string}
         */
        BackupStatus: "ONLINE" | "OFFLINE" | "MAINTENANCE" | "OTHER";
        /** BackupTriggerResponse */
        BackupTriggerResponse: {
            /** Message */
            message: string;
            /** Job Info */
            job_info: {
                [key: string]: unknown;
            };
        };
        /** BackupUpdate */
        BackupUpdate: {
            /**
             * Backup Name
             * @description ชื่อ Backup (ต้องไม่ซ้ำ)
             */
            backup_name?: string | null;
            /**
             * Description
             * @description คำอธิบาย Backup
             */
            description?: string | null;
            /**
             * Policy Id
             * @description Policy ID ที่เชื่อมโยง
             */
            policy_id?: string | null;
            /**
             * Os Id
             * @description Operating System ID ที่เชื่อมโยง
             */
            os_id?: string | null;
            /** @description สถานะของ Backup */
            status?: components["schemas"]["BackupStatus"] | null;
            /**
             * Auto Backup
             * @description เปิดใช้งาน Auto Backup
             */
            auto_backup?: boolean | null;
        };
        /** BackupUpdateResponse */
        BackupUpdateResponse: {
            /** Message */
            message: string;
            backup: components["schemas"]["BackupResponse"];
        };
        /** Body_create_template_configuration_templates__post */
        Body_create_template_configuration_templates__post: {
            /**
             * Template Name
             * @description ชื่อ Template (ต้องไม่ซ้ำ)
             */
            template_name: string;
            /**
             * Description
             * @description คำอธิบาย Template
             */
            description?: string | null;
            /**
             * Template Type
             * @description ประเภทของ Template
             * @default OTHER
             */
            template_type: string;
            /**
             * Tag Name
             * @description Tag name ที่เชื่อมโยง
             */
            tag_name?: string | null;
            /**
             * Config Content
             * @description เนื้อหา Config (Text)
             */
            config_content?: string | null;
            /**
             * File
             * @description ไฟล์ Config (.txt, .yaml, .yml)
             */
            file?: string | null;
        };
        /** Body_upload_os_file_operating_systems__os_id__upload_post */
        Body_upload_os_file_operating_systems__os_id__upload_post: {
            /** File */
            file: string;
            /** Version */
            version?: string | null;
        };
        /** Body_upload_template_config_configuration_templates__template_id__upload_post */
        Body_upload_template_config_configuration_templates__template_id__upload_post: {
            /** File */
            file: string;
        };
        /** BulkBackupRequest */
        BulkBackupRequest: {
            /** Device Ids */
            device_ids: string[];
            /** Backup Profile Id */
            backup_profile_id?: string | null;
            /** @default RUNNING */
            config_type: components["schemas"]["ConfigType"];
        };
        /**
         * ConfigType
         * @enum {string}
         */
        ConfigType: "RUNNING" | "STARTUP" | "CANDIDATE" | "OTHER";
        /** ConfigurationTemplateCreateResponse */
        ConfigurationTemplateCreateResponse: {
            /** Message */
            message: string;
            template: components["schemas"]["ConfigurationTemplateResponse"];
        };
        /** ConfigurationTemplateDeleteResponse */
        ConfigurationTemplateDeleteResponse: {
            /** Message */
            message: string;
        };
        /** ConfigurationTemplateDetailResponse */
        ConfigurationTemplateDetailResponse: {
            /** Id */
            id: string;
            /** Config Content */
            config_content?: string | null;
            /** File Name */
            file_name?: string | null;
            /** File Size */
            file_size?: number | null;
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
        };
        /** ConfigurationTemplateListResponse */
        ConfigurationTemplateListResponse: {
            /**
             * Total
             * @description จำนวนทั้งหมด
             */
            total: number;
            /**
             * Page
             * @description หน้าปัจจุบัน
             */
            page: number;
            /**
             * Page Size
             * @description ขนาดหน้า
             */
            page_size: number;
            /**
             * Templates
             * @description รายการ Template
             */
            templates: components["schemas"]["ConfigurationTemplateResponse"][];
        };
        /** ConfigurationTemplateResponse */
        ConfigurationTemplateResponse: {
            /**
             * Template Name
             * @description ชื่อ Template (ต้องไม่ซ้ำ)
             */
            template_name: string;
            /**
             * Description
             * @description คำอธิบาย Template
             */
            description?: string | null;
            /**
             * @description ประเภทของ Template
             * @default OTHER
             */
            template_type: components["schemas"]["TemplateType"];
            /**
             * Id
             * @description ID ของ Template
             */
            id: string;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
            /**
             * Tags
             * @description Tags ที่เชื่อมโยง
             * @default []
             */
            tags: components["schemas"]["RelatedTagInfoTemplate"][];
            /** @description รายละเอียด Config (ถ้ามี) */
            detail?: components["schemas"]["ConfigurationTemplateDetailResponse"] | null;
            /**
             * Device Count
             * @description จำนวน Device ที่ใช้ Template นี้
             * @default 0
             */
            device_count: number | null;
        };
        /** ConfigurationTemplateUpdate */
        ConfigurationTemplateUpdate: {
            /**
             * Template Name
             * @description ชื่อ Template (ต้องไม่ซ้ำ)
             */
            template_name?: string | null;
            /**
             * Description
             * @description คำอธิบาย Template
             */
            description?: string | null;
            /** @description ประเภทของ Template */
            template_type?: components["schemas"]["TemplateType"] | null;
            /**
             * Tag Names
             * @description รายการ Tag names ที่เชื่อมโยง
             */
            tag_names?: string[] | null;
        };
        /** ConfigurationTemplateUpdateResponse */
        ConfigurationTemplateUpdateResponse: {
            /** Message */
            message: string;
            template: components["schemas"]["ConfigurationTemplateResponse"];
        };
        /** DeploymentRequest */
        DeploymentRequest: {
            /** Template Id */
            template_id: string;
            /** Device Ids */
            device_ids: string[];
            /** Variables */
            variables: {
                [key: string]: unknown;
            };
        };
        /** DeviceBackupRecordResponse */
        DeviceBackupRecordResponse: {
            /** Id */
            id: string;
            /** Device Id */
            device_id: string;
            /** Backup Profile Id */
            backup_profile_id: string | null;
            /** Config Type */
            config_type: string;
            /** Config Format */
            config_format: string;
            /** Status */
            status: string;
            /** Error Message */
            error_message: string | null;
            /** File Size */
            file_size: number | null;
            /** File Hash */
            file_hash: string | null;
            /** Triggered By User */
            triggered_by_user: string | null;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
        };
        /** DeviceCredentialsCreate */
        DeviceCredentialsCreate: {
            /**
             * Device Username
             * @description ชื่อผู้ใช้สำหรับเข้าใช้งานอุปกรณ์เครือข่าย
             */
            device_username: string;
            /**
             * Device Password
             * @description รหัสผ่านสำหรับเข้าใช้งานอุปกรณ์เครือข่าย
             */
            device_password: string;
        };
        /** DeviceCredentialsCreateResponse */
        DeviceCredentialsCreateResponse: {
            /**
             * Message
             * @description ข้อความแจ้งผลลัพธ์
             */
            message: string;
            /** @description ข้อมูล Device Credentials ที่สร้างแล้ว */
            device_credentials: components["schemas"]["DeviceCredentialsResponse"];
        };
        /** DeviceCredentialsDeleteResponse */
        DeviceCredentialsDeleteResponse: {
            /**
             * Message
             * @description ข้อความแจ้งผลลัพธ์
             */
            message: string;
        };
        /** DeviceCredentialsResponse */
        DeviceCredentialsResponse: {
            /**
             * Device Username
             * @description ชื่อผู้ใช้สำหรับเข้าใช้งานอุปกรณ์เครือข่าย
             */
            device_username: string;
            /**
             * Id
             * @description ID ของ Device Credentials
             */
            id: string;
            /**
             * User Id
             * @description ID ของผู้ใช้
             */
            user_id: string;
            /**
             * Has Password
             * @description มีรหัสผ่านหรือไม่
             */
            has_password: boolean;
            /**
             * Created At
             * Format: date-time
             * @description วันที่สร้าง
             */
            created_at: string;
            /**
             * Updated At
             * Format: date-time
             * @description วันที่อัปเดตล่าสุด
             */
            updated_at: string;
        };
        /** DeviceCredentialsUpdate */
        DeviceCredentialsUpdate: {
            /**
             * Device Username
             * @description ชื่อผู้ใช้สำหรับเข้าใช้งานอุปกรณ์เครือข่าย
             */
            device_username?: string | null;
            /**
             * Device Password
             * @description รหัสผ่านใหม่สำหรับเข้าใช้งานอุปกรณ์เครือข่าย
             */
            device_password?: string | null;
        };
        /** DeviceCredentialsUpdateResponse */
        DeviceCredentialsUpdateResponse: {
            /**
             * Message
             * @description ข้อความแจ้งผลลัพธ์
             */
            message: string;
            /** @description ข้อมูล Device Credentials ที่อัปเดตแล้ว */
            device_credentials: components["schemas"]["DeviceCredentialsResponse"];
        };
        /** DeviceCredentialsVerifyRequest */
        DeviceCredentialsVerifyRequest: {
            /**
             * Username
             * @description ชื่อผู้ใช้ที่ต้องการตรวจสอบ
             */
            username: string;
            /**
             * Password
             * @description รหัสผ่านที่ต้องการตรวจสอบ
             */
            password: string;
        };
        /**
         * DeviceDetailResponse
         * @description Response สำหรับ device detail
         */
        DeviceDetailResponse: {
            /** Success */
            success: boolean;
            /** Code */
            code: string;
            /** Message */
            message: string;
            /** Device */
            device?: {
                [key: string]: unknown;
            } | null;
        };
        /** DeviceIpAssignRequest */
        DeviceIpAssignRequest: {
            /** Subnet Id */
            subnet_id: string;
            /** Description */
            description?: string | null;
        };
        /**
         * DeviceListResponse
         * @description Response สำหรับ list devices
         */
        DeviceListResponse: {
            /** Success */
            success: boolean;
            /** Code */
            code: string;
            /** Message */
            message: string;
            /** Devices */
            devices: {
                [key: string]: unknown;
            }[];
            /** Total */
            total: number;
            /** Source */
            source: string;
        };
        /** DeviceNetworkCreate */
        DeviceNetworkCreate: {
            /**
             * Serial Number
             * @description Serial Number (ต้องไม่ซ้ำ)
             */
            serial_number: string;
            /**
             * Device Name
             * @description ชื่ออุปกรณ์
             */
            device_name: string;
            /**
             * Device Model
             * @description รุ่นอุปกรณ์
             */
            device_model: string;
            /**
             * @description ประเภทอุปกรณ์
             * @default SWITCH
             */
            type: components["schemas"]["TypeDevice"];
            /**
             * @description สถานะอุปกรณ์
             * @default OFFLINE
             */
            status: components["schemas"]["StatusDevice"];
            /**
             * Ip Address
             * @description IP Address (สามารถเว้นว่างได้)
             */
            ip_address?: string | null;
            /**
             * Mac Address
             * @description MAC Address (ต้องไม่ซ้ำ)
             */
            mac_address: string;
            /**
             * Description
             * @description คำอธิบายอุปกรณ์
             */
            description?: string | null;
            /**
             * Phpipam Address Id
             * @description phpIPAM Address ID
             */
            phpipam_address_id?: string | null;
            /**
             * Policy Id
             * @description Policy ID
             */
            policy_id?: string | null;
            /**
             * Os Id
             * @description Operating System ID
             */
            os_id?: string | null;
            /**
             * Backup Id
             * @description Backup ID
             */
            backup_id?: string | null;
            /**
             * Local Site Id
             * @description Local Site ID
             */
            local_site_id?: string | null;
            /**
             * Configuration Template Id
             * @description Configuration Template ID
             */
            configuration_template_id?: string | null;
            /**
             * Node Id
             * @description ODL node-id (unique, URL-safe). ใช้เป็น path parameter ใน API. ตัวอย่าง: CSR1, router-core-01
             */
            node_id?: string | null;
            /**
             * @description Vendor สำหรับเลือก driver
             * @default OTHER
             */
            vendor: components["schemas"]["DeviceVendor"];
            /**
             * @description โปรโตคอลการจัดการ (NETCONF หรือ OPENFLOW)
             * @default NETCONF
             */
            management_protocol: components["schemas"]["ManagementProtocol"];
            /**
             * Datapath Id
             * @description สำหรับ OpenFlow (เช่น '0000000000000001')
             */
            datapath_id?: string | null;
            /**
             * Netconf Host
             * @description IP/Hostname สำหรับ NETCONF connection
             */
            netconf_host?: string | null;
            /**
             * Netconf Port
             * @description NETCONF port (default: 830, SSH)
             * @default 830
             */
            netconf_port: number;
        };
        /** DeviceNetworkCreateResponse */
        DeviceNetworkCreateResponse: {
            /** Message */
            message: string;
            device: components["schemas"]["DeviceNetworkResponse"];
        };
        /** DeviceNetworkDeleteResponse */
        DeviceNetworkDeleteResponse: {
            /** Message */
            message: string;
        };
        /** DeviceNetworkListResponse */
        DeviceNetworkListResponse: {
            /**
             * Total
             * @description จำนวนทั้งหมด
             */
            total: number;
            /**
             * Page
             * @description หน้าปัจจุบัน
             */
            page: number;
            /**
             * Page Size
             * @description ขนาดหน้า
             */
            page_size: number;
            /**
             * Devices
             * @description รายการอุปกรณ์
             */
            devices: components["schemas"]["DeviceNetworkResponse"][];
        };
        /**
         * DeviceNetworkResponse
         * @description Response model สำหรับ Device Network (ไม่ inherit จาก Base เพื่อให้ node_id optional)
         */
        DeviceNetworkResponse: {
            /**
             * Id
             * @description ID ของอุปกรณ์
             */
            id: string;
            /** Serial Number */
            serial_number: string;
            /** Device Name */
            device_name: string;
            /** Device Model */
            device_model: string;
            /** Type */
            type: string;
            /** Status */
            status: string;
            /** Ip Address */
            ip_address?: string | null;
            /** Mac Address */
            mac_address: string;
            /** Description */
            description?: string | null;
            /** Phpipam Address Id */
            phpipam_address_id?: string | null;
            /** Policy Id */
            policy_id?: string | null;
            /** Os Id */
            os_id?: string | null;
            /** Backup Id */
            backup_id?: string | null;
            /** Local Site Id */
            local_site_id?: string | null;
            /** Configuration Template Id */
            configuration_template_id?: string | null;
            /**
             * Node Id
             * @description ODL node-id (unique, URL-safe)
             */
            node_id?: string | null;
            /**
             * Vendor
             * @description Vendor สำหรับเลือก driver
             */
            vendor?: string | null;
            /**
             * Management Protocol
             * @description โปรโตคอลการจัดการ
             * @default NETCONF
             */
            management_protocol: string;
            /**
             * Datapath Id
             * @description สำหรับ OpenFlow
             */
            datapath_id?: string | null;
            /**
             * Netconf Host
             * @description IP/Hostname สำหรับ NETCONF
             */
            netconf_host?: string | null;
            /**
             * Netconf Port
             * @description NETCONF port
             * @default 830
             */
            netconf_port: number;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
            /**
             * Odl Mounted
             * @description Mount status ใน ODL
             * @default false
             */
            odl_mounted: boolean;
            /**
             * Odl Connection Status
             * @description ODL connection status
             */
            odl_connection_status?: string | null;
            /**
             * Last Synced At
             * @description Last sync time from ODL
             */
            last_synced_at?: string | null;
            /**
             * Ready For Intent
             * @description พร้อมใช้งาน Intent API หรือไม่
             * @default false
             */
            ready_for_intent: boolean;
            /**
             * Tags
             * @description Tags ที่เชื่อมโยง
             */
            tags?: components["schemas"]["RelatedTagInfo"][];
            operatingSystem?: components["schemas"]["RelatedOSInfo"] | null;
            localSite?: components["schemas"]["RelatedSiteInfo"] | null;
            policy?: components["schemas"]["RelatedPolicyInfo"] | null;
            backup?: components["schemas"]["RelatedBackupInfo"] | null;
            configuration_template?: components["schemas"]["RelatedTemplateInfo"] | null;
        };
        /** DeviceNetworkUpdate */
        DeviceNetworkUpdate: {
            /**
             * Serial Number
             * @description Serial Number (ต้องไม่ซ้ำ)
             */
            serial_number?: string | null;
            /**
             * Device Name
             * @description ชื่ออุปกรณ์
             */
            device_name?: string | null;
            /**
             * Device Model
             * @description รุ่นอุปกรณ์
             */
            device_model?: string | null;
            /** @description ประเภทอุปกรณ์ */
            type?: components["schemas"]["TypeDevice"] | null;
            /** @description สถานะอุปกรณ์ */
            status?: components["schemas"]["StatusDevice"] | null;
            /**
             * Ip Address
             * @description IP Address (สามารถเว้นว่างได้)
             */
            ip_address?: string | null;
            /**
             * Mac Address
             * @description MAC Address (ต้องไม่ซ้ำ)
             */
            mac_address?: string | null;
            /**
             * Description
             * @description คำอธิบายอุปกรณ์
             */
            description?: string | null;
            /**
             * Phpipam Address Id
             * @description phpIPAM Address ID
             */
            phpipam_address_id?: string | null;
            /**
             * Policy Id
             * @description Policy ID
             */
            policy_id?: string | null;
            /**
             * Os Id
             * @description Operating System ID
             */
            os_id?: string | null;
            /**
             * Backup Id
             * @description Backup ID
             */
            backup_id?: string | null;
            /**
             * Tag Id
             * @description Tag ID
             */
            tag_id?: string | null;
            /**
             * Local Site Id
             * @description Local Site ID
             */
            local_site_id?: string | null;
            /**
             * Configuration Template Id
             * @description Configuration Template ID
             */
            configuration_template_id?: string | null;
            /**
             * Node Id
             * @description ODL node-id สำหรับ topology-netconf
             */
            node_id?: string | null;
            /** @description Vendor สำหรับเลือก driver */
            vendor?: components["schemas"]["DeviceVendor"] | null;
            /** @description Protocol สำหรับจัดการ (NETCONF หรือ OPENFLOW) */
            management_protocol?: components["schemas"]["ManagementProtocol"] | null;
            /**
             * Datapath Id
             * @description OpenFlow datapath_id
             */
            datapath_id?: string | null;
            /**
             * Netconf Host
             * @description IP/Hostname สำหรับ NETCONF connection
             */
            netconf_host?: string | null;
            /**
             * Netconf Port
             * @description NETCONF port
             */
            netconf_port?: number | null;
        };
        /** DeviceNetworkUpdateResponse */
        DeviceNetworkUpdateResponse: {
            /** Message */
            message: string;
            device: components["schemas"]["DeviceNetworkResponse"];
        };
        /** DeviceTagAssignment */
        DeviceTagAssignment: {
            /**
             * Tag Ids
             * @description รายการ Tag IDs
             */
            tag_ids: string[];
        };
        /**
         * DeviceVendor
         * @description Vendor สำหรับเลือก driver ใน NBI
         * @enum {string}
         */
        DeviceVendor: "CISCO" | "HUAWEI" | "JUNIPER" | "ARISTA" | "OTHER";
        /** ForgotPasswordRequest */
        ForgotPasswordRequest: {
            /**
             * Email
             * Format: email
             */
            email: string;
        };
        /** ForgotPasswordResponse */
        ForgotPasswordResponse: {
            /** Message */
            message: string;
            /** Email */
            email: string;
            /**
             * Expires At
             * Format: date-time
             */
            expires_at: string;
        };
        /** HTTPValidationError */
        HTTPValidationError: {
            /** Detail */
            detail?: components["schemas"]["ValidationError"][];
        };
        /** HealthOut */
        HealthOut: {
            /**
             * Status
             * @default ok
             */
            status: string;
        };
        /**
         * IntentRequest
         * @description Intent API Request
         *
         *     Attributes:
         *         intent: Intent action (e.g., "show.interface", "interface.set_ipv4")
         *         node_id: ODL device identifier (URL-safe, matches database node_id)
         *         params: Intent-specific parameters
         */
        IntentRequest: {
            /**
             * Intent
             * @example interface.set_ipv4
             * @example show.interface
             */
            intent: string;
            /**
             * Node Id
             * @description ODL device identifier. Used in RESTCONF mount path.
             * @example CSR1000vT
             * @example Router-Core-01
             */
            node_id: string;
            /** Params */
            params?: {
                [key: string]: unknown;
            };
        };
        /**
         * IntentResponse
         * @description Intent API Response
         *
         *     Attributes:
         *         success: True if intent executed successfully
         *         intent: The executed intent
         *         node_id: ODL device identifier (same as request)
         *         driver_used: Driver that was used (cisco, huawei, etc.)
         *         result: Intent execution result
         *         error: Error details if success=False
         */
        IntentResponse: {
            /** Success */
            success: boolean;
            /** Intent */
            intent: string;
            /**
             * Node Id
             * @description ODL device identifier
             */
            node_id: string;
            /** Driver Used */
            driver_used: string;
            /** Result */
            result?: {
                [key: string]: unknown;
            };
            /** Error */
            error?: {
                [key: string]: unknown;
            } | null;
        };
        /** InterfaceCreate */
        InterfaceCreate: {
            /**
             * Name
             * @description ชื่อ Interface (เช่น GigabitEthernet0/1, eth0)
             */
            name: string;
            /**
             * Device Id
             * @description Device Network ID ที่เชื่อมโยง
             */
            device_id: string;
            /**
             * Label
             * @description ชื่อย่อหรือป้ายกำกับ
             */
            label?: string | null;
            /**
             * @description สถานะของ Interface
             * @default DOWN
             */
            status: components["schemas"]["InterfaceStatus"];
            /**
             * @description ประเภทของ Interface
             * @default PHYSICAL
             */
            type: components["schemas"]["InterfaceType"];
            /**
             * Description
             * @description คำอธิบาย Interface
             */
            description?: string | null;
            /**
             * Tp Id
             * @description Termination Point ID จาก ODL สำหรัยใส่ข้อมูล topology
             */
            tp_id?: string | null;
            /**
             * Port Number
             * @description หมายเลขพอร์ตที่ใช้เขียน rule (เช่น 1, 2, 3)
             */
            port_number?: number | null;
            /**
             * Mac Address
             * @description MAC address ของ Interface
             */
            mac_address?: string | null;
        };
        /** InterfaceCreateResponse */
        InterfaceCreateResponse: {
            /** Message */
            message: string;
            interface: components["schemas"]["InterfaceResponse"];
        };
        /** InterfaceDeleteResponse */
        InterfaceDeleteResponse: {
            /** Message */
            message: string;
        };
        /** InterfaceIpAssignRequest */
        InterfaceIpAssignRequest: {
            /** Subnet Id */
            subnet_id: string;
            /** Description */
            description?: string | null;
        };
        /** InterfaceListResponse */
        InterfaceListResponse: {
            /**
             * Total
             * @description จำนวนทั้งหมด
             */
            total: number;
            /**
             * Page
             * @description หน้าปัจจุบัน
             */
            page: number;
            /**
             * Page Size
             * @description ขนาดหน้า
             */
            page_size: number;
            /**
             * Interfaces
             * @description รายการ Interface
             */
            interfaces: components["schemas"]["InterfaceResponse"][];
        };
        /** InterfaceResponse */
        InterfaceResponse: {
            /**
             * Id
             * @description ID ของ Interface
             */
            id: string;
            /** Name */
            name: string;
            /** Device Id */
            device_id: string;
            /** Label */
            label: string | null;
            status: components["schemas"]["InterfaceStatus"];
            type: components["schemas"]["InterfaceType"];
            /** Description */
            description: string | null;
            /** Tp Id */
            tp_id: string | null;
            /** Port Number */
            port_number: number | null;
            /** Mac Address */
            mac_address: string | null;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
            device?: components["schemas"]["RelatedDeviceInfo"] | null;
        };
        /**
         * InterfaceStatus
         * @enum {string}
         */
        InterfaceStatus: "UP" | "DOWN" | "ADMIN_DOWN" | "TESTING" | "OTHER";
        /**
         * InterfaceType
         * @enum {string}
         */
        InterfaceType: "PHYSICAL" | "VIRTUAL" | "LOOPBACK" | "VLAN" | "TUNNEL" | "OTHER";
        /** InterfaceUpdate */
        InterfaceUpdate: {
            /**
             * Name
             * @description ชื่อ Interface
             */
            name?: string | null;
            /**
             * Label
             * @description ชื่อย่อหรือป้ายกำกับ
             */
            label?: string | null;
            /** @description สถานะของ Interface */
            status?: components["schemas"]["InterfaceStatus"] | null;
            /** @description ประเภทของ Interface */
            type?: components["schemas"]["InterfaceType"] | null;
            /**
             * Description
             * @description คำอธิบาย Interface
             */
            description?: string | null;
            /**
             * Tp Id
             * @description Termination Point ID จาก ODL
             */
            tp_id?: string | null;
            /**
             * Port Number
             * @description หมายเลขพอร์ต
             */
            port_number?: number | null;
            /**
             * Mac Address
             * @description MAC address ของ Interface
             */
            mac_address?: string | null;
        };
        /** InterfaceUpdateResponse */
        InterfaceUpdateResponse: {
            /** Message */
            message: string;
            interface: components["schemas"]["InterfaceResponse"];
        };
        /** IpAddressCreateRequest */
        IpAddressCreateRequest: {
            /** Subnet Id */
            subnet_id: string;
            /** Ip Address */
            ip_address: string;
            /** Hostname */
            hostname?: string | null;
            /** Description */
            description?: string | null;
            /** Mac Address */
            mac_address?: string | null;
            /** Is Gateway */
            is_gateway?: number | null;
            /** Tag */
            tag?: number | null;
        };
        /** IpAddressDetailResponse */
        IpAddressDetailResponse: {
            /** Id */
            id: string;
            /** Ip */
            ip: string;
            /** Subnet Id */
            subnet_id: string;
            /** Hostname */
            hostname?: string | null;
            /** Description */
            description?: string | null;
            /** Mac */
            mac?: string | null;
            /** Is Gateway */
            is_gateway?: string | number | null;
            /** Tag */
            tag?: string | number | null;
        };
        /** IpAddressListResponse */
        IpAddressListResponse: {
            /** Addresses */
            addresses: components["schemas"]["IpAddressResponse"][];
            /** Total */
            total: number;
        };
        /** IpAddressResponse */
        IpAddressResponse: {
            /** Id */
            id: string;
            /** Ip */
            ip: string;
            /** Subnet Id */
            subnet_id: string;
            /** Hostname */
            hostname?: string | null;
            /** Description */
            description?: string | null;
            /** Mac */
            mac?: string | null;
            /** Phpipam Id */
            phpipam_id?: string | null;
        };
        /** IpAddressUpdateRequest */
        IpAddressUpdateRequest: {
            /** Hostname */
            hostname?: string | null;
            /** Description */
            description?: string | null;
            /** Mac Address */
            mac_address?: string | null;
            /** Is Gateway */
            is_gateway?: number | null;
            /** Tag */
            tag?: number | null;
        };
        /** IpAssignmentResponse */
        IpAssignmentResponse: {
            /** Message */
            message: string;
            /** Ip Address */
            ip_address: string;
            /** Subnet Id */
            subnet_id: string;
            /** Phpipam Address Id */
            phpipam_address_id: string;
            /** Device Id */
            device_id?: string | null;
            /** Interface Id */
            interface_id?: string | null;
        };
        /** LocalSiteCreate */
        LocalSiteCreate: {
            /**
             * Site Code
             * @description รหัสสถานที่ (ต้องไม่ซ้ำ)
             */
            site_code: string;
            /**
             * Site Name
             * @description ชื่อสถานที่
             */
            site_name?: string | null;
            /**
             * @description ประเภทสถานที่
             * @default DataCenter
             */
            site_type: components["schemas"]["SiteType"];
            /**
             * Building Name
             * @description ชื่ออาคาร
             */
            building_name?: string | null;
            /**
             * Floor Number
             * @description หมายเลขชั้น
             */
            floor_number?: number | null;
            /**
             * Rack Number
             * @description หมายเลขแร็ค
             */
            rack_number?: number | null;
            /**
             * Address
             * @description ที่อยู่
             */
            address?: string | null;
            /**
             * Address Detail
             * @description รายละเอียดที่อยู่เพิ่มเติม
             */
            address_detail?: string | null;
            /**
             * Sub District
             * @description ตำบล/แขวง
             */
            sub_district?: string | null;
            /**
             * District
             * @description อำเภอ/เขต
             */
            district?: string | null;
            /**
             * City
             * @description จังหวัด/เมือง
             */
            city?: string | null;
            /**
             * Zip Code
             * @description รหัสไปรษณีย์
             */
            zip_code?: string | null;
            /**
             * Country
             * @description ประเทศ
             */
            country?: string | null;
        };
        /** LocalSiteCreateResponse */
        LocalSiteCreateResponse: {
            /** Message */
            message: string;
            site: components["schemas"]["LocalSiteResponse"];
        };
        /** LocalSiteDeleteResponse */
        LocalSiteDeleteResponse: {
            /** Message */
            message: string;
        };
        /** LocalSiteListResponse */
        LocalSiteListResponse: {
            /**
             * Total
             * @description จำนวนทั้งหมด
             */
            total: number;
            /**
             * Page
             * @description หน้าปัจจุบัน
             */
            page: number;
            /**
             * Page Size
             * @description ขนาดหน้า
             */
            page_size: number;
            /**
             * Sites
             * @description รายการสถานที่
             */
            sites: components["schemas"]["LocalSiteResponse"][];
        };
        /** LocalSiteResponse */
        LocalSiteResponse: {
            /**
             * Site Code
             * @description รหัสสถานที่ (ต้องไม่ซ้ำ)
             */
            site_code: string;
            /**
             * Site Name
             * @description ชื่อสถานที่
             */
            site_name?: string | null;
            /**
             * @description ประเภทสถานที่
             * @default DataCenter
             */
            site_type: components["schemas"]["SiteType"];
            /**
             * Building Name
             * @description ชื่ออาคาร
             */
            building_name?: string | null;
            /**
             * Floor Number
             * @description หมายเลขชั้น
             */
            floor_number?: number | null;
            /**
             * Rack Number
             * @description หมายเลขแร็ค
             */
            rack_number?: number | null;
            /**
             * Address
             * @description ที่อยู่
             */
            address?: string | null;
            /**
             * Address Detail
             * @description รายละเอียดที่อยู่เพิ่มเติม
             */
            address_detail?: string | null;
            /**
             * Sub District
             * @description ตำบล/แขวง
             */
            sub_district?: string | null;
            /**
             * District
             * @description อำเภอ/เขต
             */
            district?: string | null;
            /**
             * City
             * @description จังหวัด/เมือง
             */
            city?: string | null;
            /**
             * Zip Code
             * @description รหัสไปรษณีย์
             */
            zip_code?: string | null;
            /**
             * Country
             * @description ประเทศ
             */
            country?: string | null;
            /**
             * Id
             * @description ID ของสถานที่
             */
            id: string;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
            /**
             * Device Count
             * @description จำนวนอุปกรณ์ที่เชื่อมโยง
             * @default 0
             */
            device_count: number | null;
        };
        /** LocalSiteUpdate */
        LocalSiteUpdate: {
            /**
             * Site Code
             * @description รหัสสถานที่ (ต้องไม่ซ้ำ)
             */
            site_code?: string | null;
            /**
             * Site Name
             * @description ชื่อสถานที่
             */
            site_name?: string | null;
            /** @description ประเภทสถานที่ */
            site_type?: components["schemas"]["SiteType"] | null;
            /**
             * Building Name
             * @description ชื่ออาคาร
             */
            building_name?: string | null;
            /**
             * Floor Number
             * @description หมายเลขชั้น
             */
            floor_number?: number | null;
            /**
             * Rack Number
             * @description หมายเลขแร็ค
             */
            rack_number?: number | null;
            /**
             * Address
             * @description ที่อยู่
             */
            address?: string | null;
            /**
             * Address Detail
             * @description รายละเอียดที่อยู่เพิ่มเติม
             */
            address_detail?: string | null;
            /**
             * Sub District
             * @description ตำบล/แขวง
             */
            sub_district?: string | null;
            /**
             * District
             * @description อำเภอ/เขต
             */
            district?: string | null;
            /**
             * City
             * @description จังหวัด/เมือง
             */
            city?: string | null;
            /**
             * Zip Code
             * @description รหัสไปรษณีย์
             */
            zip_code?: string | null;
            /**
             * Country
             * @description ประเทศ
             */
            country?: string | null;
        };
        /** LocalSiteUpdateResponse */
        LocalSiteUpdateResponse: {
            /** Message */
            message: string;
            site: components["schemas"]["LocalSiteResponse"];
        };
        /** LoginRequest */
        LoginRequest: {
            /**
             * Email
             * Format: email
             */
            email: string;
            /** Password */
            password: string;
        };
        /** LoginResponse */
        LoginResponse: {
            /** Message */
            message: string;
            /** Access Token */
            access_token?: string | null;
            /**
             * Token Type
             * @default bearer
             */
            token_type: string;
            /** User Id */
            user_id: string;
            /** Email */
            email: string;
            /** Name */
            name: string | null;
            /** Surname */
            surname: string | null;
            /** Role */
            role: string;
            /**
             * Requires Totp
             * @default false
             */
            requires_totp: boolean;
            /** Temp Token */
            temp_token?: string | null;
        };
        /**
         * ManagementProtocol
         * @enum {string}
         */
        ManagementProtocol: "NETCONF" | "OPENFLOW";
        /**
         * MountRequest
         * @description Request body สำหรับ mount device
         */
        MountRequest: {
            /**
             * Wait For Connection
             * @description รอจนกว่าจะ connected (max 30s)
             * @default true
             */
            wait_for_connection: boolean;
            /**
             * Max Wait Seconds
             * @description เวลารอสูงสุด (วินาที) - 5 ถึง 120
             * @default 30
             */
            max_wait_seconds: number;
        };
        /**
         * MountResponse
         * @description Response สำหรับ mount operations
         */
        MountResponse: {
            /** Success */
            success: boolean;
            /** Code */
            code: string;
            /** Message */
            message: string;
            /** Node Id */
            node_id?: string | null;
            /** Connection Status */
            connection_status?: string | null;
            /** Device Status */
            device_status?: string | null;
            /**
             * Ready For Intent
             * @default false
             */
            ready_for_intent: boolean;
            /** Data */
            data?: {
                [key: string]: unknown;
            } | null;
        };
        /** OSFileDeleteResponse */
        OSFileDeleteResponse: {
            /** Message */
            message: string;
        };
        /** OSFileListResponse */
        OSFileListResponse: {
            /** Total */
            total: number;
            /** Files */
            files: components["schemas"]["OSFileResponse"][];
        };
        /** OSFileResponse */
        OSFileResponse: {
            /** Id */
            id: string;
            /** Os Id */
            os_id: string;
            /** File Name */
            file_name: string;
            /** File Path */
            file_path: string;
            /** File Size */
            file_size: number;
            /** File Type */
            file_type: string | null;
            /** Version */
            version: string | null;
            /** Checksum */
            checksum: string | null;
            /** Uploaded By */
            uploaded_by: string | null;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
            uploaded_by_user?: components["schemas"]["RelatedUserInfoFile"] | null;
            operating_system?: components["schemas"]["RelatedOSInfoFile"] | null;
        };
        /** OSFileUploadResponse */
        OSFileUploadResponse: {
            /** Message */
            message: string;
            file: components["schemas"]["OSFileResponse"];
        };
        /**
         * OdlConfigRequest
         * @description Request body สำหรับแก้ไข ODL Config
         */
        OdlConfigRequest: {
            /**
             * Odl Base Url
             * @description Base URL ของ OpenDaylight
             */
            odl_base_url: string;
            /**
             * Odl Username
             * @description Username สำหรับ ODL
             */
            odl_username: string;
            /**
             * Odl Password
             * @description Password สำหรับ ODL
             */
            odl_password: string;
            /**
             * Odl Timeout Sec
             * @description Timeout (วินาที)
             * @default 10
             */
            odl_timeout_sec: number;
            /**
             * Odl Retry
             * @description จำนวนครั้งที่ Retry
             * @default 1
             */
            odl_retry: number;
        };
        /**
         * OdlConfigResponse
         * @description Response สำหรับแบบ ODL Config
         */
        OdlConfigResponse: {
            /** Success */
            success: boolean;
            /**
             * Message
             * @default Success
             */
            message: string;
            /** Data */
            data: {
                [key: string]: unknown;
            };
        };
        /** OperatingSystemCreate */
        OperatingSystemCreate: {
            /**
             * @description ประเภทของ OS
             * @default OTHER
             */
            os_type: components["schemas"]["OsType"];
            /**
             * Description
             * @description คำอธิบาย OS
             */
            description?: string | null;
        };
        /** OperatingSystemCreateResponse */
        OperatingSystemCreateResponse: {
            /** Message */
            message: string;
            operating_system: components["schemas"]["OperatingSystemResponse"];
        };
        /** OperatingSystemDeleteResponse */
        OperatingSystemDeleteResponse: {
            /** Message */
            message: string;
        };
        /** OperatingSystemListResponse */
        OperatingSystemListResponse: {
            /**
             * Total
             * @description จำนวนทั้งหมด
             */
            total: number;
            /**
             * Page
             * @description หน้าปัจจุบัน
             */
            page: number;
            /**
             * Page Size
             * @description ขนาดหน้า
             */
            page_size: number;
            /**
             * Operating Systems
             * @description รายการ OS
             */
            operating_systems: components["schemas"]["OperatingSystemResponse"][];
        };
        /** OperatingSystemResponse */
        OperatingSystemResponse: {
            /**
             * @description ประเภทของ OS
             * @default OTHER
             */
            os_type: components["schemas"]["OsType"];
            /**
             * Description
             * @description คำอธิบาย OS
             */
            description?: string | null;
            /**
             * Id
             * @description ID ของ OS
             */
            id: string;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
            /**
             * Tags
             * @description Tags ที่เชื่อมโยง
             */
            tags?: components["schemas"]["TagInfo"][];
            /**
             * Device Count
             * @description จำนวน Device ที่ใช้ OS นี้
             * @default 0
             */
            device_count: number | null;
            /**
             * Backup Count
             * @description จำนวน Backup ที่เชื่อมโยง
             * @default 0
             */
            backup_count: number | null;
            /**
             * Total Usage
             * @description จำนวนการใช้งานทั้งหมด
             * @default 0
             */
            total_usage: number | null;
        };
        /** OperatingSystemUpdate */
        OperatingSystemUpdate: {
            /** @description ประเภทของ OS */
            os_type?: components["schemas"]["OsType"] | null;
            /**
             * Description
             * @description คำอธิบาย OS
             */
            description?: string | null;
        };
        /** OperatingSystemUpdateResponse */
        OperatingSystemUpdateResponse: {
            /** Message */
            message: string;
            operating_system: components["schemas"]["OperatingSystemResponse"];
        };
        /** OperatingSystemUsageResponse */
        OperatingSystemUsageResponse: {
            /** Id */
            id: string;
            /** Os Type */
            os_type: string;
            /**
             * Device Networks
             * @description รายการ Device ที่ใช้ OS นี้
             */
            device_networks?: {
                [key: string]: unknown;
            }[];
            /**
             * Backups
             * @description รายการ Backup ที่เชื่อมโยง
             */
            backups?: {
                [key: string]: unknown;
            }[];
            /**
             * Total Usage
             * @description จำนวนการใช้งานทั้งหมด
             */
            total_usage: number;
        };
        /**
         * OsType
         * @enum {string}
         */
        OsType: "CISCO_IOS" | "CISCO_NXOS" | "CISCO_ASA" | "CISCO_Nexus" | "CISCO_IOS_XR" | "CISCO_IOS_XE" | "HUAWEI_VRP" | "OTHER";
        /** ParentPolicyInfo */
        ParentPolicyInfo: {
            /** Id */
            id: string;
            /** Policy Name */
            policy_name: string;
        };
        /** PasswordChangeResponse */
        PasswordChangeResponse: {
            /** Message */
            message: string;
            /** User Id */
            user_id: string;
        };
        /** PolicyCreate */
        PolicyCreate: {
            /**
             * Policy Name
             * @description ชื่อ Policy (ต้องไม่ซ้ำ)
             */
            policy_name: string;
            /**
             * Description
             * @description คำอธิบาย Policy
             */
            description?: string | null;
            /**
             * Parent Policy Id
             * @description Parent Policy ID (สำหรับ hierarchy)
             */
            parent_policy_id?: string | null;
        };
        /** PolicyCreateResponse */
        PolicyCreateResponse: {
            /** Message */
            message: string;
            policy: components["schemas"]["PolicyResponse"];
        };
        /** PolicyDeleteResponse */
        PolicyDeleteResponse: {
            /** Message */
            message: string;
        };
        /** PolicyListResponse */
        PolicyListResponse: {
            /**
             * Total
             * @description จำนวนทั้งหมด
             */
            total: number;
            /**
             * Page
             * @description หน้าปัจจุบัน
             */
            page: number;
            /**
             * Page Size
             * @description ขนาดหน้า
             */
            page_size: number;
            /**
             * Policies
             * @description รายการ Policy
             */
            policies: components["schemas"]["PolicyResponse"][];
        };
        /** PolicyResponse */
        PolicyResponse: {
            /**
             * Policy Name
             * @description ชื่อ Policy (ต้องไม่ซ้ำ)
             */
            policy_name: string;
            /**
             * Description
             * @description คำอธิบาย Policy
             */
            description?: string | null;
            /**
             * Parent Policy Id
             * @description Parent Policy ID (สำหรับ hierarchy)
             */
            parent_policy_id?: string | null;
            /**
             * Id
             * @description ID ของ Policy
             */
            id: string;
            /**
             * Created By
             * @description สร้างโดย User ID
             */
            created_by?: string | null;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
            created_by_user?: components["schemas"]["RelatedUserInfo"] | null;
            parent_policy?: components["schemas"]["ParentPolicyInfo"] | null;
            /**
             * Device Count
             * @description จำนวน Device ที่ใช้ Policy นี้
             * @default 0
             */
            device_count: number | null;
            /**
             * Backup Count
             * @description จำนวน Backup ที่ใช้ Policy นี้
             * @default 0
             */
            backup_count: number | null;
            /**
             * Child Count
             * @description จำนวน Child Policy
             * @default 0
             */
            child_count: number | null;
            /**
             * Total Usage
             * @description จำนวนการใช้งานทั้งหมด
             * @default 0
             */
            total_usage: number | null;
        };
        /** PolicyUpdate */
        PolicyUpdate: {
            /**
             * Policy Name
             * @description ชื่อ Policy (ต้องไม่ซ้ำ)
             */
            policy_name?: string | null;
            /**
             * Description
             * @description คำอธิบาย Policy
             */
            description?: string | null;
            /**
             * Parent Policy Id
             * @description Parent Policy ID (สำหรับ hierarchy)
             */
            parent_policy_id?: string | null;
        };
        /** PolicyUpdateResponse */
        PolicyUpdateResponse: {
            /** Message */
            message: string;
            policy: components["schemas"]["PolicyResponse"];
        };
        /** RegisterRequest */
        RegisterRequest: {
            /**
             * Email
             * Format: email
             */
            email: string;
            /** Name */
            name: string;
            /** Surname */
            surname: string;
            /** Password */
            password: string;
            /** Confirm Password */
            confirm_password: string;
        };
        /** RegisterResponse */
        RegisterResponse: {
            /** Message */
            message: string;
            /** Email */
            email: string;
            /**
             * Expires At
             * Format: date-time
             */
            expires_at: string;
        };
        /** RelatedBackupInfo */
        RelatedBackupInfo: {
            /** Id */
            id: string;
            /** Backup Name */
            backup_name: string;
            /** Status */
            status: string;
        };
        /** RelatedDeviceInfo */
        RelatedDeviceInfo: {
            /** Id */
            id: string;
            /** Device Name */
            device_name: string;
            /** Device Model */
            device_model: string;
            /** Serial Number */
            serial_number: string;
            /** Type */
            type: string;
        };
        /** RelatedOSInfo */
        RelatedOSInfo: {
            /** Id */
            id: string;
            /** Os Type */
            os_type: string;
        };
        /** RelatedOSInfoBackup */
        RelatedOSInfoBackup: {
            /** Id */
            id: string;
            /** Os Type */
            os_type: string;
        };
        /** RelatedOSInfoFile */
        RelatedOSInfoFile: {
            /** Id */
            id: string;
            /** Os Type */
            os_type: string;
        };
        /** RelatedPolicyInfo */
        RelatedPolicyInfo: {
            /** Id */
            id: string;
            /** Policy Name */
            policy_name: string;
        };
        /** RelatedPolicyInfoBackup */
        RelatedPolicyInfoBackup: {
            /** Id */
            id: string;
            /** Policy Name */
            policy_name: string;
        };
        /** RelatedSiteInfo */
        RelatedSiteInfo: {
            /** Id */
            id: string;
            /** Site Code */
            site_code: string;
            /** Site Name */
            site_name: string | null;
        };
        /** RelatedTagInfo */
        RelatedTagInfo: {
            /** Tag Id */
            tag_id: string;
            /** Tag Name */
            tag_name: string;
            /** Color */
            color: string;
            /** Type */
            type: string;
        };
        /** RelatedTagInfoTemplate */
        RelatedTagInfoTemplate: {
            /** Tag Id */
            tag_id: string;
            /** Tag Name */
            tag_name: string;
            /** Color */
            color: string;
            /** Type */
            type: string;
        };
        /** RelatedTemplateInfo */
        RelatedTemplateInfo: {
            /** Id */
            id: string;
            /** Template Name */
            template_name: string;
            /** Template Type */
            template_type: string;
        };
        /** RelatedUserInfo */
        RelatedUserInfo: {
            /** Id */
            id: string;
            /** Email */
            email: string;
            /** Name */
            name: string | null;
            /** Surname */
            surname: string | null;
        };
        /** RelatedUserInfoFile */
        RelatedUserInfoFile: {
            /** Id */
            id: string;
            /** Email */
            email: string;
            /** Name */
            name: string | null;
            /** Surname */
            surname: string | null;
        };
        /** ResendOtpRequest */
        ResendOtpRequest: {
            /**
             * Email
             * Format: email
             */
            email: string;
        };
        /** ResendOtpResponse */
        ResendOtpResponse: {
            /** Message */
            message: string;
            /** Email */
            email: string;
            /**
             * Expires At
             * Format: date-time
             */
            expires_at: string;
        };
        /** ResetPasswordRequest */
        ResetPasswordRequest: {
            /**
             * Email
             * Format: email
             */
            email: string;
            /** Otp Code */
            otp_code: string;
            /**
             * New Password
             * @description รหัสผ่านใหม่ขั้นต่ำ 8 ตัวอักษร
             */
            new_password: string;
        };
        /** ResetPasswordResponse */
        ResetPasswordResponse: {
            /** Message */
            message: string;
        };
        /** SectionCreateRequest */
        SectionCreateRequest: {
            /** Name */
            name: string;
            /** Description */
            description?: string | null;
            /** Master Section */
            master_section?: string | null;
            /** Permissions */
            permissions?: string | null;
            /** Strict Mode */
            strict_mode?: string | null;
            /** Subnet Ordering */
            subnet_ordering?: string | null;
            /** Order */
            order?: string | null;
            /** Show Vlan In Subnet Listing */
            show_vlan_in_subnet_listing?: boolean | null;
            /** Show Vrf In Subnet Listing */
            show_vrf_in_subnet_listing?: boolean | null;
        };
        /** SectionListResponse */
        SectionListResponse: {
            /** Sections */
            sections: components["schemas"]["SectionResponse"][];
            /** Total */
            total: number;
        };
        /** SectionResponse */
        SectionResponse: {
            /** Id */
            id: string;
            /** Name */
            name: string;
            /** Description */
            description?: string | null;
            /** Master Section */
            master_section?: string | null;
            /** Permissions */
            permissions?: string | null;
            /** Strict Mode */
            strict_mode?: string | null;
            /** Subnet Ordering */
            subnet_ordering?: string | null;
            /** Order */
            order?: string | null;
            /** Show Vlan In Subnet Listing */
            show_vlan_in_subnet_listing?: string | number | null;
            /** Show Vrf In Subnet Listing */
            show_vrf_in_subnet_listing?: string | number | null;
        };
        /** SectionUpdateRequest */
        SectionUpdateRequest: {
            /** Name */
            name?: string | null;
            /** Description */
            description?: string | null;
            /** Master Section */
            master_section?: string | null;
            /** Permissions */
            permissions?: string | null;
            /** Strict Mode */
            strict_mode?: string | null;
            /** Subnet Ordering */
            subnet_ordering?: string | null;
            /** Order */
            order?: string | null;
            /** Show Vlan In Subnet Listing */
            show_vlan_in_subnet_listing?: boolean | null;
            /** Show Vrf In Subnet Listing */
            show_vrf_in_subnet_listing?: boolean | null;
        };
        /**
         * SiteType
         * @enum {string}
         */
        SiteType: "DataCenter" | "BRANCH" | "OTHER";
        /**
         * StatusDevice
         * @enum {string}
         */
        StatusDevice: "ONLINE" | "OFFLINE" | "MAINTENANCE" | "OTHER";
        /** SubnetCreateRequest */
        SubnetCreateRequest: {
            /** Subnet */
            subnet: string;
            /** Mask */
            mask: string;
            /** Section Id */
            section_id: string;
            /** Description */
            description?: string | null;
            /** Vlan Id */
            vlan_id?: string | null;
            /** Master Subnet Id */
            master_subnet_id?: string | null;
            /** Permissions */
            permissions?: string | null;
            /** Show Name */
            show_name?: boolean | null;
            /** Dns Recursive */
            dns_recursive?: boolean | null;
            /** Dns Records */
            dns_records?: boolean | null;
            /** Allow Requests */
            allow_requests?: boolean | null;
            /** Scan Agent */
            scan_agent?: string | null;
        };
        /** SubnetDetailResponse */
        SubnetDetailResponse: {
            /** Id */
            id: string;
            /** Subnet */
            subnet: string;
            /** Mask */
            mask: string;
            /** Section Id */
            section_id: string;
            /** Description */
            description?: string | null;
            /** Vlan Id */
            vlan_id?: string | null;
            /** Master Subnet Id */
            master_subnet_id?: string | null;
            /** Permissions */
            permissions?: string | null;
            /** Show Name */
            show_name?: string | number | null;
        };
        /** SubnetListResponse */
        SubnetListResponse: {
            /** Subnets */
            subnets: components["schemas"]["SubnetResponse"][];
            /** Total */
            total: number;
        };
        /** SubnetResponse */
        SubnetResponse: {
            /** Id */
            id: string;
            /** Subnet */
            subnet?: string | null;
            /** Mask */
            mask?: string | null;
            /** Description */
            description?: string | null;
            /** Section Id */
            section_id?: string | null;
            /** Vlan Id */
            vlan_id?: string | null;
            /** Master Subnet Id */
            master_subnet_id?: string | null;
        };
        /** SubnetUpdateRequest */
        SubnetUpdateRequest: {
            /** Subnet */
            subnet?: string | null;
            /** Mask */
            mask?: string | null;
            /** Description */
            description?: string | null;
            /** Vlan Id */
            vlan_id?: string | null;
            /** Master Subnet Id */
            master_subnet_id?: string | null;
            /** Permissions */
            permissions?: string | null;
            /** Show Name */
            show_name?: boolean | null;
            /** Dns Recursive */
            dns_recursive?: boolean | null;
            /** Dns Records */
            dns_records?: boolean | null;
            /** Allow Requests */
            allow_requests?: boolean | null;
            /** Scan Agent */
            scan_agent?: string | null;
        };
        /** SubnetUsageResponse */
        SubnetUsageResponse: {
            /** Used */
            used: number;
            /** Maxhosts */
            maxhosts: number;
            /** Freehosts */
            freehosts: number;
            /** Freehosts Percent */
            freehosts_percent: number;
            /** Offline Percent */
            Offline_percent?: number | null;
            /** Used Percent */
            Used_percent: number;
            /** Reserved Percent */
            Reserved_percent?: number | null;
        };
        /**
         * SyncResponse
         * @description Response สำหรับ sync operations
         */
        SyncResponse: {
            /** Success */
            success: boolean;
            /** Code */
            code: string;
            /** Message */
            message: string;
            /** Data */
            data?: {
                [key: string]: unknown;
            } | null;
        };
        /** TagCreate */
        TagCreate: {
            /**
             * Tag Name
             * @description ชื่อ Tag (ต้องไม่ซ้ำ)
             */
            tag_name: string;
            /**
             * Description
             * @description คำอธิบาย Tag
             */
            description?: string | null;
            /**
             * @description ประเภทของ Tag (tag/group/other)
             * @default other
             */
            type: components["schemas"]["TypeTag"];
            /**
             * Color
             * @description สีของ Tag (Hex color code)
             * @default #3B82F6
             */
            color: string;
        };
        /** TagCreateResponse */
        TagCreateResponse: {
            /** Message */
            message: string;
            tag: components["schemas"]["TagResponse"];
        };
        /** TagDeleteResponse */
        TagDeleteResponse: {
            /** Message */
            message: string;
        };
        /** TagInfo */
        TagInfo: {
            /** Tag Id */
            tag_id: string;
            /** Tag Name */
            tag_name: string;
            /** Color */
            color: string;
            /** Type */
            type: string;
        };
        /** TagListResponse */
        TagListResponse: {
            /**
             * Total
             * @description จำนวนทั้งหมด
             */
            total: number;
            /**
             * Page
             * @description หน้าปัจจุบัน
             */
            page: number;
            /**
             * Page Size
             * @description ขนาดหน้า
             */
            page_size: number;
            /**
             * Tags
             * @description รายการ Tag
             */
            tags: components["schemas"]["TagResponse"][];
        };
        /** TagResponse */
        TagResponse: {
            /**
             * Tag Name
             * @description ชื่อ Tag (ต้องไม่ซ้ำ)
             */
            tag_name: string;
            /**
             * Description
             * @description คำอธิบาย Tag
             */
            description?: string | null;
            /**
             * @description ประเภทของ Tag (tag/group/other)
             * @default other
             */
            type: components["schemas"]["TypeTag"];
            /**
             * Color
             * @description สีของ Tag (Hex color code)
             * @default #3B82F6
             */
            color: string;
            /**
             * Tag Id
             * @description ID ของ Tag
             */
            tag_id: string;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
            /**
             * Device Count
             * @description จำนวน Device ที่ใช้ Tag นี้
             * @default 0
             */
            device_count: number | null;
            /**
             * Os Count
             * @description จำนวน OS ที่ใช้ Tag นี้
             * @default 0
             */
            os_count: number | null;
            /**
             * Template Count
             * @description จำนวน Template ที่ใช้ Tag นี้
             * @default 0
             */
            template_count: number | null;
            /**
             * Total Usage
             * @description จำนวนการใช้งานทั้งหมด
             * @default 0
             */
            total_usage: number | null;
        };
        /** TagUpdate */
        TagUpdate: {
            /**
             * Tag Name
             * @description ชื่อ Tag (ต้องไม่ซ้ำ)
             */
            tag_name?: string | null;
            /**
             * Description
             * @description คำอธิบาย Tag
             */
            description?: string | null;
            /** @description ประเภทของ Tag (tag/group/other) */
            type?: components["schemas"]["TypeTag"] | null;
            /**
             * Color
             * @description สีของ Tag (Hex color code)
             */
            color?: string | null;
        };
        /** TagUpdateResponse */
        TagUpdateResponse: {
            /** Message */
            message: string;
            tag: components["schemas"]["TagResponse"];
        };
        /** TagUsageResponse */
        TagUsageResponse: {
            /** Tag Id */
            tag_id: string;
            /** Tag Name */
            tag_name: string;
            /**
             * Device Networks
             * @description รายการ Device ที่ใช้ Tag
             */
            device_networks?: {
                [key: string]: unknown;
            }[];
            /**
             * Operating Systems
             * @description รายการ OS ที่ใช้ Tag
             */
            operating_systems?: {
                [key: string]: unknown;
            }[];
            /**
             * Configuration Templates
             * @description รายการ Template ที่ใช้ Tag
             */
            configuration_templates?: {
                [key: string]: unknown;
            }[];
            /**
             * Total Usage
             * @description จำนวนการใช้งานทั้งหมด
             */
            total_usage: number;
        };
        /**
         * TemplateType
         * @enum {string}
         */
        TemplateType: "NETWORK" | "SECURITY" | "OTHER";
        /** TopologyResponse */
        TopologyResponse: {
            /** Nodes */
            nodes: {
                [key: string]: unknown;
            }[];
            /** Links */
            links: {
                [key: string]: unknown;
            }[];
        };
        /** TopologySyncResponse */
        TopologySyncResponse: {
            /** Success */
            success: boolean;
            /** Message */
            message: string;
            /** Stats */
            stats: {
                [key: string]: number;
            };
        };
        /** TotpDisableRequest */
        TotpDisableRequest: {
            /** Password */
            password: string;
        };
        /** TotpSetupResponse */
        TotpSetupResponse: {
            /** Secret */
            secret: string;
            /** Provisioning Uri */
            provisioning_uri: string;
        };
        /** TotpVerifyRequest */
        TotpVerifyRequest: {
            /** Secret */
            secret: string;
            /** Otp Code */
            otp_code: string;
        };
        /**
         * TypeDevice
         * @enum {string}
         */
        TypeDevice: "SWITCH" | "ROUTER" | "FIREWALL" | "ACCESS_POINT" | "OTHER";
        /**
         * TypeTag
         * @enum {string}
         */
        TypeTag: "tag" | "group" | "other";
        /** UserChangePasswordRequest */
        UserChangePasswordRequest: {
            /** Current Password */
            current_password: string;
            /**
             * New Password
             * @description รหัสผ่านใหม่ขั้นต่ำ 8 ตัวอักษร
             */
            new_password: string;
        };
        /** UserCreateRequest */
        UserCreateRequest: {
            /**
             * Email
             * Format: email
             */
            email: string;
            /** Name */
            name?: string | null;
            /** Surname */
            surname?: string | null;
            /**
             * Password
             * @description รหัสผ่านขั้นต่ำ 8 ตัวอักษร
             */
            password: string;
            /** @default VIEWER */
            role: components["schemas"]["UserRole"];
        };
        /** UserCreateResponse */
        UserCreateResponse: {
            /** Message */
            message: string;
            user: components["schemas"]["UserResponse"];
            /** Target Role */
            target_role?: string | null;
            /** Otp Expires At */
            otp_expires_at?: string | null;
            /**
             * Requires Otp Verification
             * @default false
             */
            requires_otp_verification: boolean | null;
        };
        /** UserDeleteResponse */
        UserDeleteResponse: {
            /** Message */
            message: string;
            /** User Id */
            user_id: string;
        };
        /** UserDetailResponse */
        UserDetailResponse: {
            /** Id */
            id: string;
            /** Email */
            email: string;
            /** Name */
            name?: string | null;
            /** Surname */
            surname?: string | null;
            role: components["schemas"]["UserRole"];
            /** Email Verified */
            email_verified: boolean;
            /** Has Strong Mfa */
            has_strong_mfa: boolean;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
            /**
             * Totp Enabled
             * @default false
             */
            totp_enabled: boolean;
            /**
             * Passkeys Count
             * @default 0
             */
            passkeys_count: number;
            /**
             * Recovery Codes Count
             * @default 0
             */
            recovery_codes_count: number;
        };
        /** UserListResponse */
        UserListResponse: {
            /** Users */
            users: components["schemas"]["UserResponse"][];
            /** Total */
            total: number;
            /** Page */
            page: number;
            /** Page Size */
            page_size: number;
            /** Total Pages */
            total_pages: number;
        };
        /** UserResponse */
        UserResponse: {
            /** Id */
            id: string;
            /** Email */
            email: string;
            /** Name */
            name?: string | null;
            /** Surname */
            surname?: string | null;
            role: components["schemas"]["UserRole"];
            /** Email Verified */
            email_verified: boolean;
            /** Has Strong Mfa */
            has_strong_mfa: boolean;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
        };
        /**
         * UserRole
         * @enum {string}
         */
        UserRole: "VIEWER" | "ENGINEER" | "ADMIN" | "OWNER";
        /** UserUpdateRequest */
        UserUpdateRequest: {
            /** Email */
            email?: string | null;
            /** Name */
            name?: string | null;
            /** Surname */
            surname?: string | null;
            role?: components["schemas"]["UserRole"] | null;
            /** Email Verified */
            email_verified?: boolean | null;
            /** Has Strong Mfa */
            has_strong_mfa?: boolean | null;
        };
        /** UserUpdateResponse */
        UserUpdateResponse: {
            /** Message */
            message: string;
            user: components["schemas"]["UserResponse"];
        };
        /** ValidationError */
        ValidationError: {
            /** Location */
            loc: (string | number)[];
            /** Message */
            msg: string;
            /** Error Type */
            type: string;
            /** Input */
            input?: unknown;
            /** Context */
            ctx?: Record<string, never>;
        };
        /** VerifyOtpRequest */
        VerifyOtpRequest: {
            /**
             * Email
             * Format: email
             */
            email: string;
            /** Otp Code */
            otp_code: string;
        };
        /** VerifyOtpResponse */
        VerifyOtpResponse: {
            /** Message */
            message: string;
            /** User Id */
            user_id: string;
            /** Email */
            email: string;
            /** Email Verified */
            email_verified: boolean;
        };
        /** VerifyTotpLoginRequest */
        VerifyTotpLoginRequest: {
            /** Temp Token */
            temp_token: string;
            /** Otp Code */
            otp_code: string;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    health_health_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HealthOut"];
                };
            };
        };
    };
    register_auth_register_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RegisterRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RegisterResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    verify_otp_auth_verify_otp_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["VerifyOtpRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["VerifyOtpResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    resend_otp_auth_resend_otp_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ResendOtpRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResendOtpResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    login_auth_login_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["LoginRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LoginResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    setup_totp_auth_mfa_setup_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TotpSetupResponse"];
                };
            };
        };
    };
    verify_totp_setup_auth_mfa_verify_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TotpVerifyRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    verify_totp_login_auth_mfa_verify_totp_login_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["VerifyTotpLoginRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LoginResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    disable_totp_auth_mfa_disable_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TotpDisableRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    forgot_password_auth_forgot_password_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ForgotPasswordRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ForgotPasswordResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    reset_password_auth_reset_password_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ResetPasswordRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ResetPasswordResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_audit_logs_audit_logs_get: {
        parameters: {
            query?: {
                /** @description Filter by actor user ID */
                actor_user_id?: string | null;
                /** @description Filter by target user ID */
                target_user_id?: string | null;
                /** @description Filter by action */
                action?: components["schemas"]["AuditAction"] | null;
                /** @description Filter from date (ISO format) */
                start_date?: string | null;
                /** @description Filter to date (ISO format) */
                end_date?: string | null;
                /** @description Number of items per page */
                limit?: number;
                /** @description Start from item */
                offset?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AuditLogListResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    create_audit_log_audit_logs_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AuditLogCreate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AuditLogResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_audit_log_audit_logs__audit_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                audit_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AuditLogResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_audit_stats_audit_stats_get: {
        parameters: {
            query?: {
                /** @description Start date */
                start_date?: string | null;
                /** @description End date */
                end_date?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_users_users__get: {
        parameters: {
            query?: {
                /** @description หมายเลขหน้า */
                page?: number;
                /** @description จำนวนรายการต่อหน้า */
                page_size?: number;
                /** @description กรองตาม email */
                email?: string | null;
                /** @description กรองตาม name */
                name?: string | null;
                /** @description กรองตาม surname */
                surname?: string | null;
                /** @description กรองตาม role */
                role?: components["schemas"]["UserRole"] | null;
                /** @description กรองตามสถานะ email verification */
                email_verified?: boolean | null;
                /** @description กรองตาม MFA status */
                has_strong_mfa?: boolean | null;
                /** @description ค้นหาใน email, name, surname */
                search?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UserListResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    create_user_users__post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UserCreateRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UserCreateResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_user_by_id_users__user_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                user_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UserDetailResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_user_users__user_id__put: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                user_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UserUpdateRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UserUpdateResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    delete_user_users__user_id__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                user_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UserDeleteResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    change_password_users__user_id__change_password_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                user_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UserChangePasswordRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PasswordChangeResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_my_profile_users_profile_me_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UserDetailResponse"];
                };
            };
        };
    };
    promote_user_role_users__user_id__promote_role_post: {
        parameters: {
            query: {
                target_role: components["schemas"]["UserRole"];
            };
            header?: never;
            path: {
                user_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UserUpdateResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_device_credentials_device_credentials__get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DeviceCredentialsResponse"];
                };
            };
        };
    };
    update_device_credentials_device_credentials__put: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["DeviceCredentialsUpdate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DeviceCredentialsUpdateResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    create_device_credentials_device_credentials__post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["DeviceCredentialsCreate"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DeviceCredentialsCreateResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    delete_device_credentials_device_credentials__delete: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DeviceCredentialsDeleteResponse"];
                };
            };
        };
    };
    verify_device_credentials_device_credentials_verify_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["DeviceCredentialsVerifyRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_local_sites_local_sites__get: {
        parameters: {
            query?: {
                /** @description Page number */
                page?: number;
                /** @description Number of items per page */
                page_size?: number;
                /** @description Filter by site type */
                site_type?: string | null;
                /** @description Search by site_code, site_name, address, city */
                search?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LocalSiteListResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    create_local_site_local_sites__post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["LocalSiteCreate"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LocalSiteCreateResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_local_site_local_sites__site_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                site_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LocalSiteResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_local_site_local_sites__site_id__put: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                site_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["LocalSiteUpdate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LocalSiteUpdateResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    delete_local_site_local_sites__site_id__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                site_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LocalSiteDeleteResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_tags_tags__get: {
        parameters: {
            query?: {
                /** @description Page number */
                page?: number;
                /** @description Number of items per page */
                page_size?: number;
                /** @description Search by tag_name, description */
                search?: string | null;
                /** @description Include usage count */
                include_usage?: boolean;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TagListResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    create_tag_tags__post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TagCreate"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TagCreateResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_tag_tags__tag_id__get: {
        parameters: {
            query?: {
                /** @description Include usage count */
                include_usage?: boolean;
            };
            header?: never;
            path: {
                tag_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TagResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_tag_tags__tag_id__put: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                tag_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TagUpdate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TagUpdateResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    delete_tag_tags__tag_id__delete: {
        parameters: {
            query?: {
                /** @description Force delete even if in use (use with caution) */
                force?: boolean;
            };
            header?: never;
            path: {
                tag_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TagDeleteResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_tag_usage_tags__tag_id__usage_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                tag_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TagUsageResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_operating_systems_operating_systems__get: {
        parameters: {
            query?: {
                /** @description หน้าที่ต้องการ */
                page?: number;
                /** @description จำนวนรายการต่อหน้า */
                page_size?: number;
                /** @description กรองตามประเภท OS */
                os_type?: string | null;
                /** @description ค้นหาจาก description */
                search?: string | null;
                /** @description รวมจำนวนการใช้งาน */
                include_usage?: boolean;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OperatingSystemListResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    create_operating_system_operating_systems__post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["OperatingSystemCreate"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OperatingSystemCreateResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_operating_system_operating_systems__os_id__get: {
        parameters: {
            query?: {
                /** @description รวมจำนวนการใช้งาน */
                include_usage?: boolean;
            };
            header?: never;
            path: {
                os_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OperatingSystemResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_operating_system_operating_systems__os_id__put: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                os_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["OperatingSystemUpdate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OperatingSystemUpdateResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    delete_operating_system_operating_systems__os_id__delete: {
        parameters: {
            query?: {
                /** @description Force delete even if in use */
                force?: boolean;
            };
            header?: never;
            path: {
                os_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OperatingSystemDeleteResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_operating_system_usage_operating_systems__os_id__usage_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                os_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OperatingSystemUsageResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    upload_os_file_operating_systems__os_id__upload_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                os_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "multipart/form-data": components["schemas"]["Body_upload_os_file_operating_systems__os_id__upload_post"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OSFileUploadResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_os_files_operating_systems__os_id__files_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                os_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OSFileListResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    download_os_file_operating_systems__os_id__files__file_id__download_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                os_id: string;
                file_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    delete_os_file_operating_systems__os_id__files__file_id__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                os_id: string;
                file_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OSFileDeleteResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    assign_tags_to_os_operating_systems__os_id__tags_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                os_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": string[];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OperatingSystemUpdateResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    remove_tags_from_os_operating_systems__os_id__tags_delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                os_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": string[];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OperatingSystemUpdateResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_policies_policies__get: {
        parameters: {
            query?: {
                /** @description Page number */
                page?: number;
                /** @description Page size */
                page_size?: number;
                /** @description Search by policy_name, description */
                search?: string | null;
                /** @description Filter by parent policy ID */
                parent_policy_id?: string | null;
                /** @description Include usage count */
                include_usage?: boolean;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PolicyListResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    create_policy_policies__post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PolicyCreate"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PolicyCreateResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_policy_policies__policy_id__get: {
        parameters: {
            query?: {
                /** @description Include usage count */
                include_usage?: boolean;
            };
            header?: never;
            path: {
                policy_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PolicyResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_policy_policies__policy_id__put: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                policy_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PolicyUpdate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PolicyUpdateResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    delete_policy_policies__policy_id__delete: {
        parameters: {
            query?: {
                /** @description Force delete even if in use */
                force?: boolean;
            };
            header?: never;
            path: {
                policy_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PolicyDeleteResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_backups_backups__get: {
        parameters: {
            query?: {
                /** @description Page number */
                page?: number;
                /** @description Number of items per page */
                page_size?: number;
                /** @description Filter by status */
                status?: string | null;
                /** @description Search by backup_name, description */
                search?: string | null;
                /** @description Filter by Policy ID */
                policy_id?: string | null;
                /** @description Filter by OS ID */
                os_id?: string | null;
                /** @description Filter by auto_backup */
                auto_backup?: boolean | null;
                /** @description Include usage count */
                include_usage?: boolean;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BackupListResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    create_backup_backups__post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["BackupCreate"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BackupCreateResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_backup_backups__backup_id__get: {
        parameters: {
            query?: {
                /** @description Include usage count */
                include_usage?: boolean;
            };
            header?: never;
            path: {
                backup_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BackupResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_backup_backups__backup_id__put: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                backup_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["BackupUpdate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BackupUpdateResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    delete_backup_backups__backup_id__delete: {
        parameters: {
            query?: {
                /** @description Force delete even if in use */
                force?: boolean;
            };
            header?: never;
            path: {
                backup_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BackupDeleteResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_templates_configuration_templates__get: {
        parameters: {
            query?: {
                /** @description หน้าที่ต้องการ */
                page?: number;
                /** @description จำนวนรายการต่อหน้า */
                page_size?: number;
                /** @description กรองตามประเภท Template */
                template_type?: string | null;
                /** @description ค้นหาจาก template_name, description */
                search?: string | null;
                /** @description กรองตาม Tag name */
                tag_name?: string | null;
                /** @description รวมจำนวนการใช้งาน */
                include_usage?: boolean;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ConfigurationTemplateListResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    create_template_configuration_templates__post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "multipart/form-data": components["schemas"]["Body_create_template_configuration_templates__post"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ConfigurationTemplateCreateResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_template_configuration_templates__template_id__get: {
        parameters: {
            query?: {
                /** @description รวมจำนวนการใช้งาน */
                include_usage?: boolean;
            };
            header?: never;
            path: {
                template_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ConfigurationTemplateResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_template_configuration_templates__template_id__put: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                template_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ConfigurationTemplateUpdate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ConfigurationTemplateUpdateResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    delete_template_configuration_templates__template_id__delete: {
        parameters: {
            query?: {
                /** @description บังคับลบแม้มีการใช้งาน */
                force?: boolean;
            };
            header?: never;
            path: {
                template_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ConfigurationTemplateDeleteResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    upload_template_config_configuration_templates__template_id__upload_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                template_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "multipart/form-data": components["schemas"]["Body_upload_template_config_configuration_templates__template_id__upload_post"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ConfigurationTemplateResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_devices_device_networks__get: {
        parameters: {
            query?: {
                /** @description หน้าที่ต้องการ */
                page?: number;
                /** @description จำนวนรายการต่อหน้า */
                page_size?: number;
                /** @description กรองตามประเภทอุปกรณ์ */
                device_type?: string | null;
                /** @description กรองตามสถานะ */
                status?: string | null;
                /** @description ค้นหาจาก device_name, model, serial, IP */
                search?: string | null;
                /** @description กรองตาม OS ID */
                os_id?: string | null;
                /** @description กรองตาม Local Site ID */
                local_site_id?: string | null;
                /** @description กรองตาม Policy ID */
                policy_id?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DeviceNetworkListResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    create_device_device_networks__post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["DeviceNetworkCreate"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DeviceNetworkCreateResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_device_device_networks__device_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                device_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DeviceNetworkResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_device_device_networks__device_id__put: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                device_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["DeviceNetworkUpdate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DeviceNetworkUpdateResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    delete_device_device_networks__device_id__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                device_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DeviceNetworkDeleteResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    assign_tags_to_device_device_networks__device_id__tags_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                device_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["DeviceTagAssignment"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DeviceNetworkUpdateResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    remove_tags_from_device_device_networks__device_id__tags_delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                device_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["DeviceTagAssignment"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DeviceNetworkUpdateResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    sync_openflow_devices_device_networks_sync_openflow_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: unknown;
                    };
                };
            };
        };
    };
    get_interfaces_interfaces__get: {
        parameters: {
            query?: {
                /** @description Page number */
                page?: number;
                /** @description Number of items per page */
                page_size?: number;
                /** @description Filter by Device ID */
                device_id?: string | null;
                /** @description Filter by status */
                status?: string | null;
                /** @description Filter by interface type */
                interface_type?: string | null;
                /** @description Search by name, label, or description */
                search?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InterfaceListResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    create_interface_interfaces__post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["InterfaceCreate"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InterfaceCreateResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_interfaces_by_device_interfaces_device__device_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                device_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InterfaceResponse"][];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_interface_interfaces__interface_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                interface_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InterfaceResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_interface_interfaces__interface_id__put: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                interface_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["InterfaceUpdate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InterfaceUpdateResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    delete_interface_interfaces__interface_id__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                interface_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InterfaceDeleteResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_subnets_ipam_subnets_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SubnetListResponse"];
                };
            };
        };
    };
    create_subnet_ipam_subnets_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SubnetCreateRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SubnetDetailResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_subnet_addresses_ipam_subnets__subnet_id__addresses_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                subnet_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["IpAddressListResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    assign_ip_to_device_ipam_devices__device_id__assign_ip_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                device_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["DeviceIpAssignRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["IpAssignmentResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    release_device_ip_ipam_devices__device_id__release_ip_delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                device_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    assign_ip_to_interface_ipam_interfaces__interface_id__assign_ip_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                interface_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["InterfaceIpAssignRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["IpAssignmentResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    release_interface_ip_ipam_interfaces__interface_id__release_ip_delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                interface_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_subnet_detail_ipam_subnets__subnet_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                subnet_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SubnetDetailResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    delete_subnet_ipam_subnets__subnet_id__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                subnet_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_subnet_ipam_subnets__subnet_id__patch: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                subnet_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SubnetUpdateRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SubnetDetailResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_subnet_usage_ipam_subnets__subnet_id__usage_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                subnet_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SubnetUsageResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_sections_ipam_sections_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SectionListResponse"];
                };
            };
        };
    };
    create_section_ipam_sections_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SectionCreateRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SectionResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    delete_section_ipam_sections__section_id__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                section_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_section_ipam_sections__section_id__patch: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                section_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SectionUpdateRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SectionResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_section_subnets_ipam_sections__section_id__subnets_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                section_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SubnetListResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    create_ip_address_ipam_addresses_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["IpAddressCreateRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["IpAddressDetailResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_ip_address_ipam_addresses__address_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                address_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["IpAddressDetailResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    delete_ip_address_ipam_addresses__address_id__delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                address_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    update_ip_address_ipam_addresses__address_id__patch: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                address_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["IpAddressUpdateRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["IpAddressDetailResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    search_ip_addresses_ipam_addresses_search_get: {
        parameters: {
            query: {
                /** @description Search query (IP address or hostname) */
                q: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["IpAddressListResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_subnet_children_ipam_subnets__subnet_id__children_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                subnet_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SubnetListResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    list_supported_intents_api_v1_nbi_intents_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    handle_intent_api_v1_nbi_intents_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["IntentRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["IntentResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_intent_info_api_v1_nbi_intents__intent_name__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                intent_name: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    list_devices_api_v1_nbi_devices_get: {
        parameters: {
            query?: {
                /** @description แสดงเฉพาะ devices ที่ mount ใน ODL */
                mounted_only?: boolean;
                /** @description Filter by vendor (cisco, huawei, etc.) */
                vendor?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DeviceListResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_device_info_api_v1_nbi_devices__device_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                device_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DeviceDetailResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_device_capabilities_api_v1_nbi_devices__device_id__capabilities_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                device_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_odl_mounted_nodes_api_v1_nbi_odl_nodes_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    sync_devices_from_odl_api_v1_nbi_odl_sync_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SyncResponse"];
                };
            };
        };
    };
    get_odl_config_api_v1_nbi_odl_config_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OdlConfigResponse"];
                };
            };
        };
    };
    update_odl_config_api_v1_nbi_odl_config_put: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["OdlConfigRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OdlConfigResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    mount_device_api_v1_nbi_devices__node_id__mount_post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                node_id: string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["MountRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MountResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    unmount_device_api_v1_nbi_devices__node_id__mount_delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                node_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MountResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    check_device_status_api_v1_nbi_devices__node_id__status_get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                node_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MountResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    nbi_health_check_api_v1_nbi_health_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    discover_interfaces_api_v1_nbi_devices__node_id__interfaces_discover_get: {
        parameters: {
            query?: {
                /** @description Force refresh cache */
                force_refresh?: boolean;
            };
            header?: never;
            path: {
                node_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_interface_names_api_v1_nbi_devices__node_id__interfaces_names_get: {
        parameters: {
            query?: {
                /** @description Force refresh cache */
                force_refresh?: boolean;
            };
            header?: never;
            path: {
                node_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    invalidate_cache_api_v1_nbi_devices__node_id__interfaces_cache_delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                node_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    trigger_topology_sync_api_v1_nbi_topology_sync_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TopologySyncResponse"];
                };
            };
        };
    };
    get_hybrid_topology_api_v1_nbi_topology_get: {
        parameters: {
            query?: {
                /** @description Filter topology by local site ID */
                local_site_id?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TopologyResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    probe_odl_api_v1_debug_odl_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    debug_env_api_v1_debug_env_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
        };
    };
    get_backup_stats_summary_api_v1_devices_backups_stats_summary_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BackupStatsResponse"];
                };
            };
        };
    };
    trigger_bulk_backup_api_v1_devices_backups_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["BulkBackupRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BackupTriggerResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_device_backup_history_api_v1_devices_backups_device__device_id__get: {
        parameters: {
            query?: {
                limit?: number;
                page?: number;
            };
            header?: never;
            path: {
                device_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DeviceBackupRecordResponse"][];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_backup_record_details_api_v1_devices_backups__record_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                record_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    compare_backup_records_api_v1_devices_backups_diff_post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["BackupDiffRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BackupDiffResponse"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    create_deployment_deployments__post: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["DeploymentRequest"];
            };
        };
        responses: {
            /** @description Successful Response */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    get_deployment_status_deployments__job_id__get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                job_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": unknown;
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
}
