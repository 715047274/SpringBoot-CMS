package in.hocg.web.modules.admin.service;

import in.hocg.web.modules.admin.filter.UserDataTablesInputFilter;
import in.hocg.web.modules.admin.filter.UserFilter;
import in.hocg.web.lang.CheckError;
import in.hocg.web.lang.body.response.LeftMenu;
import in.hocg.web.modules.admin.domain.SysMenu;
import in.hocg.web.modules.admin.domain.Role;
import in.hocg.web.modules.admin.domain.User;
import org.springframework.data.mongodb.datatables.mapping.DataTablesOutput;

import java.util.Collection;
import java.util.List;

/**
 * Created by hocgin on 2017/11/2.
 * email: hocgin@gmail.com
 */
public interface UserService {
    List<User> findAll();
    
    DataTablesOutput<User> data(UserDataTablesInputFilter input);
    
    void delete(CheckError checkError, String... id);
    
    void insert(UserFilter user, CheckError checkError);
    
    void updateAvailable(String id, boolean available);
    
    User find(String id);
    
    List<User> findAllById(String... ids);
    
    void update(UserFilter filter, CheckError checkError);
    
    void update(User user);
    
    void addRoleToUser(String roleId, String... userIds);
    
    void removeRoleFormUser(String roleId, String... userIds);
    
    void removeDepartmentField(String... ids);
    
    Collection<Role> findRoleByUser(String id);
    
    Collection<SysMenu> findSysMenuByUser(String id);
    
    LeftMenu getLeftMenu(String id);
}