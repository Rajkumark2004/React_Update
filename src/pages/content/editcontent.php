<?php

$servername = "localhost";
$username = "hostsbds_newlayout";
$password = "newlayout@3233";
$dbname = "hostsbds_newlayout";


// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);
// Check connection
if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}
$login_id= $_SESSION["login_id"];

$sql = "SELECT * FROM chat_master where staff_id= $login_id Group By class_id";
$result = $conn->query($sql);

?>

<!-- Content Wrapper. Contains page content -->
<div class="content-wrapper">
    <!-- Content Header (Page header) -->
    <section class="content-header">
        <h1>
            <i class="fa fa-download"></i> <?php echo $this->lang->line('download_center'); ?></h1>

    </section>

    <!-- Main content -->
    <section class="content">
        <div class="row">
            <div class="col-md-2">
                <div class="box border0">
                    <div class="box-header with-border">
                        <h3 class="box-title"><?php echo $this->lang->line('download_center'); ?></h3>
                    </div>
                    <ul class="tablists">
                        
                        <!-- <li class="<?php echo set_Submenu('content/assignment'); ?>">
                            <a class="<?php echo set_Submenu('content/assignment'); ?>" href="<?php echo base_url(); ?>admin/content/lessonplans"><img src="<?php echo base_url(); ?>/backend/images/sidebar/submenu/download_center/1.png" alt="icon1" class="img-fluid" style="width:20px"> <?php echo $this->lang->line('lesson_plans'); ?></a>
                        </li>      -->
                        
                        
                        <li class="<?php echo set_Submenu('content/syllabus'); ?>">
                            <a class="<?php echo set_Submenu('content/syllabus'); ?>" href="<?php echo base_url(); ?>admin/content/syllabus"><img src="<?php echo base_url(); ?>/backend/images/sidebar/submenu/download_center/2.png" alt="icon2" class="img-fluid" style="width:20px"> <?php echo $this->lang->line('syllabus'); ?></a>
                        </li>
            
                        
                        <li class="<?php echo set_Submenu('content/studymaterial'); ?>">
                            <a class="<?php echo set_Submenu('content/studymaterial'); ?>" href="<?php echo base_url(); ?>admin/content/weeklyschedule"><img src="<?php echo base_url(); ?>/backend/images/sidebar/submenu/download_center/3.png" alt="icon3" class="img-fluid" style="width:20px"> <?php echo $this->lang->line('weekly_schedule'); ?></a>
                        </li> 
                        
                        
                        <!-- <li class="<?php echo set_Submenu('content/other'); ?>">
                            <a class="<?php echo set_Submenu('content/other'); ?>" href="<?php echo base_url(); ?>admin/content/yearplans"><img src="<?php echo base_url(); ?>/backend/images/sidebar/submenu/download_center/4.png" alt="icon4" class="img-fluid" style="width:20px"> <?php echo $this->lang->line('year_plans'); ?></a>
                        </li> -->
                        
                        <li class="<?php echo set_Submenu('content/worksheets'); ?>">
                            <a class="<?php echo set_Submenu('content/worksheets'); ?>" href="<?php echo base_url(); ?>admin/content/worksheets"><img src="<?php echo base_url(); ?>/backend/images/sidebar/submenu/download_center/1.png" alt="icon1" class="img-fluid" style="width:20px"> <?php echo $this->lang->line('work_sheets'); ?></a>
                        </li>
                        
                         <li class="<?php echo set_Submenu('content/gallery'); ?>">
                            <a class="<?php echo set_Submenu('content/gallery'); ?>" href="<?php echo base_url(); ?>admin/staff/gallery"><img src="<?php echo base_url(); ?>/backend/images/sidebar/submenu/download_center/1.png" alt="icon1" class="img-fluid" style="width:20px"> Gallery</a>
                        </li>
                    </ul>
                </div>
            </div><!--./col-md-3-->
            <?php
            if ($this->rbac->hasPrivilege('upload_content', 'can_add')) {
                ?>
                <div class="col-md-4">
                    <!-- Horizontal Form -->
                    <div class="box box-primary">
                        <div class="box-header with-border">
                            <h3 class="box-title"><?php echo $this->lang->line('upload_content'); ?></h3>
                        </div><!-- /.box-header -->
                        <!-- form start -->

                        <form id="form1" action="<?php echo site_url('admin/content/edit/' . $id) ?>"  id="employeeform" name="employeeform" method="post"  enctype='multipart/form-data' accept-charset="utf-8">
                            <div class="box-body">
                                <?php if ($this->session->flashdata('msg')) { ?>
                                    <?php echo $this->session->flashdata('msg') ?>
                                <?php } ?>
                                <?php echo $this->customlib->getCSRF(); ?>
                                <input type="hidden" name="id" value="<?php echo set_value('id', $editpost['id']); ?>" >
                                <?php 
                                    $raw_cls_sec_ids = explode(',', $editpost['cls_sec_id']);
                                    $sections_data = $this->section_model->getsectionsbyclssecid($raw_cls_sec_ids);
                                    $section_ids = array_column($sections_data, 'section_id');
                                ?>
                                <div class="form-group">
                                    <label for="exampleInputEmail1"><?php echo $this->lang->line('content_title'); ?></label><small class="req"> *</small>
                                    <input autofocus="" id="content_title" name="content_title" placeholder="" type="text" class="form-control"  value="<?php echo set_value('content_title', $editpost['title']); ?>" />
                                    <span class="text-danger"><?php echo form_error('content_title'); ?></span>
                                </div>

                                <?php
                                // $content_disable = "content_disable";
                                // if (set_checkbox('content_available[]', 'student')) {
                                //     $content_disable = "";
                                // }
                                ?>
                                <div class="upload_content <?php echo $content_disable; ?>">
                                    <div class="checkbox" style="display:none">
                                        <label><input type="checkbox" value="Yes" name="visibility" id="chk" <?php if (set_value('visibility') == "Yes") echo "checked=checked"; ?>/><b><?php echo $this->lang->line('available_for_all_classes'); ?> </b></label>
                                    </div>

                                    
                                    
                                </div>
                                
                                <div class="form-group">
                                    <label><?php echo $this->lang->line('class'); ?></label><small class="req"> *</small>
                                    <select autofocus="" id="searchclassid" name="class_id" onchange="getSectionByClass_all(this.value, 0, 'sections')" class="form-control modal_class_id">
                                        <option value=""><?php echo $this->lang->line('select'); ?></option>
                                        <?php
                                        foreach ($classlist as $class) {
                                        ?>
                                            <option <?php
    
                                                    ?> value="<?php echo $class['id'] ?>" <?php if (set_value('class_id', $editpost['class_id']) == $class['id']) echo "selected=selected"; ?>><?php echo $class['class'] ?></option>
                                        <?php
                                        }
                                        ?>
                                    </select>
                                    <span class="text-danger" id="error_class_id"></span>
                                </div>
                                
                                <div class="form-group relative">
                                    <label><?php echo $this->lang->line('section'); ?></label>
                                    <small class="req"> *</small>
                                    <div id="checkbox-dropdown-container" class="checkbox-dropdown-container">
                                        <div class="">
                                            <div class="custom-select" id="custom-select"><?php echo $this->lang->line('select'); ?></div>
                                            <div id="custom-select-option-box" class="custom-select-option-box">
                                                <div class="custom-select-option checkbox">
                                                    <label class="vertical-middle line-h-18">
                                                        <input class="custom-select-option-checkbox" type="checkbox" name="select_all" id="select_all"> <?php echo $this->lang->line('select_all'); ?>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <span class="text-danger" id="error_class_id"></span>
                                </div>

                                <div class="form-group">
                                    <label for="exampleInputEmail1"><?php echo $this->lang->line('content_type'); ?></label><small class="req"> *</small>

                                    <select  id="content_type" name="content_type" class="form-control" >
                                        <option value=""><?php echo $this->lang->line('select'); ?></option>
                                        <?php
                                        foreach ($ght as $key => $type) {
                                            ?>
                                            <option value="<?php echo $key; ?>" <?php if (set_value('content_type', $editpost['type']) == $key) echo "selected=selected"; ?>><?php echo $type; ?></option>
                                            <?php
                                        }
                                        ?>
                                    </select>
                                    <span class="text-danger"><?php echo form_error('content_type'); ?></span>
                                </div>
                                <div class="form-group" style="display:none"> <!-- Radio group !-->
                                    <label class="control-label"><?php echo $this->lang->line('available_for'); ?></label><small class="req"> *</small>
                                    <?php
                                    foreach ($content_available as $cont_avail_key => $cont_avail_value) {
                                        ?>
                                        <div class="checkbox">
                                            <label>
                                                <input type="checkbox" checked class="content_available" name="content_available[]" value="<?php echo $cont_avail_key; ?>" <?php echo set_checkbox('content_available[]', $cont_avail_key); ?>>
                                                <?php echo $cont_avail_value; ?>
                                            </label>
                                        </div>
                                        <?php
                                    }
                                    ?>
                                    <span class="text-danger"><?php echo form_error('content_available[]'); ?></span>

                                </div>     
                                
                                
                                

                                <div class="row">
                                    <div class="col-md-12">
                                        <div class="form-group">
                                            <label for="exampleInputEmail1"><?php echo $this->lang->line('upload_date'); ?></label><small class="req"> *</small>
                                            <input id="upload_date" name="upload_date" placeholder="" type="text" class="form-control date"  value="<?php echo set_value('date', date($this->customlib->getSchoolDateFormat(), $this->customlib->dateyyyymmddTodateformat($editpost['date']))); ?>" readonly="readonly" />
                                            <span class="text-danger"><?php echo form_error('upload_date'); ?></span>
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-12">
                                        <div class="form-group">
                                            <label for="exampleInputEmail1"><?php echo $this->lang->line('description'); ?></label>
                                            <textarea class="form-control" id="description" name="note" placeholder="" rows="3" placeholder="Enter ..."><?php echo set_value('note', $editpost['note']); ?></textarea>
                                            <span class="text-danger"></span>
                                        </div>
                                    </div>
                                </div>
                                <!--<div class="row">-->
                                <!--    <div class="col-md-12">-->
                                <!--        <div class="form-group">-->
                                <!--            <label for="exampleInputFile"><?php echo $this->lang->line('content_file'); ?></label><small class="req"> *</small>-->
                                <!--            <input class="filestyle form-control" data-height="40" type='file' name='file' id="file" size='20' />-->
                                                <!--<label for="exampleInputFile">Content URL</label><small class="req"> *</small>-->
                                                <!--<input class="form-control" type='url' name='url' id="url" />-->
                                <!--        </div>-->
                                <!--        <span class="text-danger"><?php echo form_error('file'); ?></span>-->
                                <!--    </div>-->
                                <!--</div>-->
                                
                                <div class="form-group">
                                    <label for="exampleInputEmail1"><?php echo $this->lang->line('content_file'); ?></label><small class="req"> *</small>
                                    <input class="filestyle form-control" data-height="40" type='file' name='file' id="file" size='20' />
                                    <input type="hidden" name="old_file" value="<?php echo $editpost['file']; ?>">
                                    <span class="text-danger"><?php echo form_error('file'); ?></span>
                                   <?php if(!empty($editpost['file'])){
                                        ?>
                                        <div class="sign_image">
                                        <div class="fadeheight-sms">
                                         <p class=""> <a class="uploadclosebtn" title="<?php echo $this->lang->line('delete_file'); ?>"><i class="fa fa-trash-o" onclick="removesign_image()"></i></a><?php echo $editpost['file'];?>
                                         </p>
                                        </div>
                                    </div>                                    
                                        <?php }?>
                                </div>
                            </div><!-- /.box-body -->

                            <div class="box-footer">
                                <button type="submit" class="btn btn-info pull-right"><?php echo $this->lang->line('save'); ?></button>
                            </div>
                        </form>
                    </div>

                </div><!--/.col (right) -->
                <!-- left column -->
            <?php
            
            }
            
            ?>
            <div class="col-md-<?php
            if ($this->rbac->hasPrivilege('upload_content', 'can_add')) {
                echo "6";
            } else {
                echo "6";
            }
            ?>">
                <!-- general form elements -->
                <div class="box box-primary">
                    <div class="box-header ptbnull">
                        <h3 class="box-title titlefix"><?php echo $this->lang->line('content_list'); ?></h3>
                        <div class="box-tools pull-right">

                        </div><!-- /.box-tools -->
                    </div><!-- /.box-header -->
                    <div class="box-body">
                        <div class="mailbox-controls">
                            <!-- Check all button -->
                            <div class="pull-right">

                            </div><!-- /.pull-right -->
                        </div>
                        <div class="mailbox-messages table-responsive">
                            <div class="download_label"><?php echo $this->lang->line('content_list'); ?></div>
                            <table class="table table-striped table-bordered table-hover example">
                                <thead>
                                    <tr>
                                        <th><?php echo $this->lang->line('content_title'); ?></th>
                                        <th><?php echo $this->lang->line('type'); ?></th>
                                        <th><?php echo $this->lang->line('date'); ?></th>
                                        <th><?php echo $this->lang->line('available_for'); ?></th>
                                        <th><?php echo $this->lang->line('class'); ?></th>
                                        <th class="text-right"><?php echo $this->lang->line('action'); ?>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php
                                    $count = 1;
                                    foreach ($list as $data) {
                                        ?> 
                                        <tr>
                                            <td class="mailbox-name">
                                                <a href="#" data-toggle="popover" class="detail_popover"><?php echo $data['title'] ?></a>
                                                <div class="fee_detail_popover" style="display: none">
                                                    <?php
                                                    if ($data['note'] == "") {
                                                        ?>
                                                        <p class="text text-danger"><?php echo $this->lang->line('no_description'); ?></p>
                                                        <?php
                                                    } else {
                                                        ?>
                                                        <p class="text text-info"><?php echo $data['note']; ?></p>
                                                        <?php
                                                    }
                                                    ?>
                                                </div>
                                            </td>
                                            <td class="mailbox-name"><?php
                                                $type = $data['type'];
                                                echo $this->lang->line($type);
                                                ?></td>
                                            <td class="mailbox-name"><?php
                                                if ($data['date'] != '0000-00-00') {
                                                    echo date($this->customlib->getSchoolDateFormat(), $this->customlib->dateyyyymmddTodateformat($data['date']));
                                                }
                                                ?></td>
                                            <td class="mailbox-name">
                                                <ul class="list-unstyled">

                                                    <?php
                                                    $roles = explode(",", $data['role']);
                                                    foreach ($roles as $role_k => $role_v) {
                                                        ?>
                                                        <li><?php echo $role_v; ?></li>
                                                        <?php
                                                    }
                                                    ?>
                                                </ul>
                                            </td>  
                                            <td class="mailbox-name"><?php
                                                if ($data['is_public'] == "Yes") {
                                                    echo "ALL Classes";
                                                } elseif (in_array('student', explode(",", $data['role']))) {

                                                    echo $data['class'];
                                                }
                                                ?></td>
                                            <td class="mailbox-date pull-right">

                                                <a data-placement="left" href="<?php echo base_url(); ?><?php echo $data['file'] ?>"class="btn btn-default btn-xs"  data-toggle="tooltip" title="<?php echo $this->lang->line('download'); ?>" target="_blank">
                                                    <i class="fa fa-download"></i>
                                                </a>
                                                <a data-placement="left" href="<?php echo base_url(); ?>admin/content/edit/<?php echo $data['id'] ?>" class="btn btn-default btn-xs"  data-toggle="tooltip" title="<?php echo $this->lang->line('edit'); ?>">
                                                    <i class="fa fa-pencil"></i>
                                                </a>
                                                <?php
                                                if ($this->rbac->hasPrivilege('upload_content', 'can_delete')) {
                                                    ?>
                                                    <a data-placement="left" href="<?php echo base_url(); ?>admin/content/delete/<?php echo $data['id'] ?>"class="btn btn-default btn-xs"  data-toggle="tooltip" title="<?php echo $this->lang->line('delete'); ?>" onclick="return confirm('<?php echo $this->lang->line('delete_confirm') ?>');">
                                                        <i class="fa fa-remove"></i>
                                                    </a>
                                                <?php } ?>

                                            </td>
                                        </tr>
                                        <?php
                                    }
                                    $count++;
                                    ?>

                                </tbody>
                            </table><!-- /.table -->
                        </div><!-- /.mail-box-messages -->

                    </div><!-- /.box-body -->

                </div>
            </div><!--/.col (left) -->
            <!-- right column -->
        </div>     
    </section><!-- /.content -->
</div><!-- /.content-wrapper -->
<script type="text/javascript">
    $(document).ready(function () {


        $("#btnreset").click(function () {

            $("#form1")[0].reset();
        });
        var class_id = $('#class_id').val();
        var section_id = '<?php echo set_value('section_id') ?>';
        getSectionByClass(class_id, section_id);
        $(document).on('change', '#class_id', function (e) {
            $('#section_id').html("");
            var class_id = $(this).val();
            getSectionByClass(class_id, 0);
        });
        function getSectionByClass(class_id, section_id) {
            if (class_id != "") {
                $('#section_id').html("");
                var base_url = '<?php echo base_url() ?>';
                var div_data = '<option value=""><?php echo $this->lang->line('select'); ?></option>';
                $.ajax({
                    type: "GET",
                    <?php if($_SESSION["role"] != "Teacher") { ?>
                                url: base_url + "sections/getByClass",
                                 <?php }else { ?>
                                   url: base_url + "sections/getByClass1",
                                  <?php } ?>
                    data: {'class_id': class_id},
                    dataType: "json",
                    success: function (data) {
                        $.each(data, function (i, obj)
                        {
                            var sel = "";
                            if (section_id == obj.section_id) {
                                sel = "selected";
                            }
                            div_data += "<option value=" + obj.id + " " + sel + ">" + obj.section + "</option>";
                        });
                        console.log(data);
                        $('#section_id').append(div_data);
                    }
                });
            }
        }
    });
    $(document).ready(function () {
        $(document).on("click", '.content_available', function (e) {
            var avai_value = $(this).val();
            if (avai_value === "student") {
                console.log(avai_value);
                if ($(this).is(":checked")) {

                    $(this).closest("div").parents().find('.upload_content').removeClass("content_disable");

                } else {
                    $(this).closest("div").parents().find('.upload_content').addClass("content_disable");
                }
            }
        });
        $("#chk").click(function () {
            if ($(this).is(":checked")) {
                $("#class_id").prop("disabled", true);
            } else {
                $("#class_id").prop("disabled", false);
            }
        });
        if ($("#chk").is(":checked")) {
            $("#class_id").prop("disabled", true);
        } else {
            $("#class_id").prop("disabled", false);
        }

    });

    $(document).ready(function () {
        $('.detail_popover').popover({
            placement: 'right',
            trigger: 'hover',
            container: 'body',
            html: true,
            content: function () {
                return $(this).closest('td').find('.fee_detail_popover').html();
            }
        });
    });
    
    
    function IsCheckYearPlan()
    {
        var contenttype = $('#content_type');
        var selectcalss = $('#class_id').val();
        var selectsection = $('#section_id').val();
        
        $.ajax({
            url: '<?php echo base_url("admin/content/checkyearplans"); ?>',
            method: 'post',
            data: { class_id : selectcalss, section_id : selectsection},
            dataType: 'json',
                success: function(data) {
                    console.log(data);
                    contenttype.find('option').prop('disabled', false);

                    if (data.length > 0) {
                        $.each(data, function(index) {
                            contenttype.find('option[value="' + this["type"] + '"]').prop('disabled', true);
                        });
                    }
                    
                }
        });
        
    }
    
    
</script>

<script type="text/javascript">
    $(document).ready(function(e) {
        let section_ids = <?php echo json_encode($section_ids); ?>;
        // let class_id = "<?php echo $class_id; ?>";
        let class_id = $('#searchclassid').val();
        getSectionByClass_all(class_id, section_ids, 'secid');
    });
    
    function getSectionByClass_all(class_id, section_id, select_control) {

        if (class_id != "") {
            $('#' + select_control).html("");
            var base_url = '<?php echo base_url() ?>';
            var div_data = '';
            $.ajax({
                type: "GET",
                url: base_url + "sections/getByClass",
                data: {
                    'class_id': class_id
                },
                dataType: "json",
                beforeSend: function() {
                    $('.custom-select-option-box').closest('div').find("input[name='select_all']").attr('checked', false);
                    $('.custom-select-option-box').children().not(':first').remove();
                },
                success: function(data) {
                    $.each(data, function(i, obj) {
                        var isChecked = Array.isArray(section_id) ?
                            section_id.includes(obj.section_id.toString()) :
                            section_id == obj.section_id;

                        var s = $('<div>', {
                            class: 'custom-select-option checkbox',
                        }).append($('<label>', {
                            class: 'vertical-middle line-h-18',
                        }).append($('<input />', {
                            class: 'custom-select-option-checkbox',
                            type: 'checkbox',
                            name: "section[]",
                            val: obj.id,
                            checked: isChecked // This pre-selects the checkbox if matched
                        })).append(obj.section));

                        $('.custom-select-option-box').append(s);
                    });
                },
                complete: function() {

                }
            });
        } else {
            $('#sections').html('');
        }
    }
</script>


<script>
    $(document).on('click', ".custom-select", function() {
        $(".custom-select-option-box").toggle();
    });

    $(".custom-select-option").on("click", function(e) {
        var checkboxObj = $(this).children("input");
        if ($(e.target).attr("class") != "custom-select-option-checkbox") {
            if ($(checkboxObj).prop('checked') == true) {
                $(checkboxObj).prop('checked', false)
            } else {
                $(checkboxObj).prop("checked", true);
            }
        }
    });

    $(document).on('click', function(event) {
        if (event.target.className != "custom-select" && !$(event.target).closest('div').hasClass("custom-select-option")) {
            $(".custom-select-option-box").hide();
        }
    });

    $(document).on('change', '#select_all', function() {
        $('input:checkbox', $('.checkbox-dropdown-container')).not(this).prop('checked', this.checked);
    });

    $(document).on('click', '.select_all', function(e) {
        if (this.checked) {
            $(this).closest('div.table-responsive').find('[type=checkbox]').prop('checked', true);
        } else {
            $(this).closest('div.table-responsive').find('[type=checkbox]').prop('checked', false);
        }
    });
</script>

<script type="text/javascript">
    function removesign_image(){
       var result = confirm("<?php echo $this->lang->line('delete_confirm')?>");
        if (result) {
            $('.sign_image').html('<input type="hidden" name="removesign_image" value="1">');
        } 
    }
</script>