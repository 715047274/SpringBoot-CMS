package in.hocg.web.lang.body.response;

import in.hocg.web.modules.domain.Menu;
import lombok.Data;

import java.io.Serializable;
import java.util.List;
import java.util.Map;

/**
 * Created by hocgin on 2017/11/14.
 * email: hocgin@gmail.com
 */
@Data
public class LeftMenu implements Serializable {
    private List<Menu> root;
    private Map<String, List<Menu>> children;
}