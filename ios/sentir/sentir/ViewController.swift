//
//  ViewController.swift
//  sentir
//
//  Created by Rodrigo Presbiteris on 14/08/15.
//  Copyright (c) 2015 Rodrigo Presbiteris. All rights reserved.
//

import UIKit

class ViewController: UIViewController {

    @IBOutlet weak var image: UIImageView!

    var message: NSDictionary!

    override func viewDidLoad() {
        super.viewDidLoad()
        
        image.hidden = true;
        
        loadData();
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }

    func loadData() {
        let baseURL = NSURL(string: "http://192.168.43.116:3000/api/messages/receive")
        let sharedSession = NSURLSession.sharedSession()
        let downloadTask: NSURLSessionDownloadTask = sharedSession.downloadTaskWithURL(baseURL!, completionHandler: { (location: NSURL!, response:NSURLResponse!, error: NSError!) -> Void in
            if (error == nil) {
                let dataObject = NSData(contentsOfURL: location)
                self.message = NSJSONSerialization.JSONObjectWithData(dataObject!, options: nil, error: nil) as NSDictionary
                
                dispatch_async(dispatch_get_main_queue(), { () -> Void in
                    self.showMessage()
                })
            } else {
                NSLog("%@", error)
            }
        })
        
        downloadTask.resume()
    }
    
    func showMessage() {
        NSLog("%@", self.message)
        
        var events = self.message["events"] as NSArray

        image.hidden = true;

        for (var i = 0; i < events.count; i++) {
            switch (events[i]["type"] as String) {
                case "image":
                    image.hidden = false;
                    image.image = imageFromString(events[i]["value"] as String)

                    break;
                case "":
                    break;
                default:
                    break;
            }
        }
    }
    
    func imageFromString(imageName: String) -> UIImage {
        var iconName = UIImage(named: imageName)
        return iconName!
    }


}

