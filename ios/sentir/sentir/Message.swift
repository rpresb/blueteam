import Foundation

struct Message {
    var id:NSString
    var events:NSArray
    
    init(messageDic:NSDictionary) {
        id = messageDic["id"] as NSString
        events = messageDic["events"] as NSArray
    }
    
}