package in.hocg.web.modules.web.admin.system;

import in.hocg.web.filter.UserToRoleFilter;
import in.hocg.web.filter.RoleFilter;
import in.hocg.web.filter.RoleDataTablesInputFilter;
import in.hocg.web.filter.group.Insert;
import in.hocg.web.filter.group.Update1;
import in.hocg.web.filter.group.Update2;
import in.hocg.web.filter.lang.IdsFilter;
import in.hocg.web.lang.CheckError;
import in.hocg.web.lang.body.response.Results;
import in.hocg.web.modules.domain.Role;
import in.hocg.web.modules.service.RoleService;
import in.hocg.web.modules.service.UserService;
import in.hocg.web.modules.web.BaseController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.datatables.mapping.DataTablesOutput;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

/**
 * Created by hocgin on 2017/10/29.
 * email: hocgin@gmail.com
 */
@Controller
@RequestMapping("/admin/system/role")
public class RoleController extends BaseController {
    private UserService userService;
    private RoleService roleService;
    public final String BASE_TEMPLATES_PATH = "/admin/system/role/%s";
    
    @Autowired
    public RoleController(RoleService roleService,
                          UserService userService) {
        this.roleService = roleService;
        this.userService = userService;
    }
    
    @GetMapping("/index.html")
    public String vIndex(Model model) {
        return String.format(BASE_TEMPLATES_PATH, "index");
    }
    
    @GetMapping("/add-view.html")
    public String vAdd(Model model) {
        return String.format(BASE_TEMPLATES_PATH, "add-view");
    }
    
    @GetMapping("/query-modal.html")
    public String vQuery() {
        return String.format(BASE_TEMPLATES_PATH, "query-modal");
    }
    
    @GetMapping("/update-info-view/{id}")
    public String vUpdateInfo(@PathVariable("id") String id, Model model) {
        model.addAttribute("role", roleService.find(id));
        return String.format(BASE_TEMPLATES_PATH, "update-info-view");
    }
    
    @RequestMapping("/detail/{id}")
    public String vDetail(@PathVariable("id") String id, Model model) {
        Role role = roleService.find(id);
        
        model.addAttribute("role", role);
        return "/admin/system/role/detail-modal";
    }
    
    @GetMapping("/update-permission-view/{id}")
    public String vUpdatePermission(@PathVariable("id") String id, Model model) {
        model.addAttribute("role", roleService.find(id));
        return String.format(BASE_TEMPLATES_PATH, "update-permission-view");
    }
    
    @GetMapping("/select-user-view/{id}")
    public String vSelectUser(@PathVariable("id") String id, Model model) {
        Role role = roleService.find(id);
        model.addAttribute("role", role);
        return String.format(BASE_TEMPLATES_PATH, "select-user-view");
    }
    
    
    @RequestMapping("/data")
    @ResponseBody
    public DataTablesOutput<Role> data(@RequestBody RoleDataTablesInputFilter input) {
        return roleService.data(input);
    }
    
    /**
     * 增加一个角色
     *
     * @param filter
     * @return
     */
    @RequestMapping("/insert")
    @ResponseBody
    @PreAuthorize("hasRole('ADMIN')")
    public Results insert(@Validated({Insert.class}) RoleFilter filter,
                          BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            return Results.check(bindingResult);
        }
        CheckError checkError = CheckError.get();
        roleService.insert(filter, checkError);
        return Results.check(checkError, "新建角色成功");
    }
    
    @RequestMapping("/update")
    @ResponseBody
    @PreAuthorize("hasRole('ADMIN')")
    public Results update(@Validated({Update1.class}) RoleFilter filter,
                          BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            return Results.check(bindingResult);
        }
        CheckError checkError = CheckError.get();
        roleService.updateDescription(filter, checkError);
        return Results.check(checkError, "修改信息成功");
    }
    
    @PostMapping("/update-permission")
    @ResponseBody
    @PreAuthorize("hasRole('ADMIN')")
    public Results updatePermission(@Validated({Update2.class}) RoleFilter filter,
                                    BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            return Results.check(bindingResult);
        }
        CheckError checkError = CheckError.get();
        roleService.updatePermission(filter, checkError);
        return Results.check(checkError, "更新权限成功");
    }
    
    /**
     * 删除
     *
     * @param filter
     * @return
     */
    @RequestMapping("/delete")
    @ResponseBody
    @PreAuthorize("hasRole('ADMIN')")
    public Results delete(@Validated IdsFilter filter,
                          BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            return Results.check(bindingResult);
        }
        CheckError checkError = CheckError.get();
        roleService.delete(filter.getId());
        return Results.check(checkError, "删除成功");
    }
    
    @PostMapping("/available/{id}")
    @ResponseBody
    @PreAuthorize("hasRole('ADMIN')")
    public Results available(@PathVariable("id") String id, boolean available) {
        roleService.updateAvailable(id, available);
        return Results.success()
                .setMessage(String.format("%s成功", available ? "开启" : "禁用"));
    }
    
    
    @PostMapping("/add-user")
    @ResponseBody
    @PreAuthorize("hasRole('ADMIN')")
    public Results addUser(@Validated UserToRoleFilter filter,
                           BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            return Results.check(bindingResult);
        }
        userService.addRoleToUser(filter.getRole(), filter.getUsers());
        return Results.success()
                .setMessage("分配用户成功");
    }
    
    
    @PostMapping("/remove-user")
    @ResponseBody
    @PreAuthorize("hasRole('ADMIN')")
    public Results removeUser(@Validated UserToRoleFilter filter,
                              BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            return Results.check(bindingResult);
        }
        userService.removeRoleFormUser(filter.getRole(), filter.getUsers());
        return Results.success()
                .setMessage("分配用户成功");
    }
}
